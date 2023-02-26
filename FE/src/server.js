const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const app = express();
const port = process?.env?.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const TOKEN_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJAd+vqmbCSV/2UsO7/blN4qLm/qa9ohLlyLfjTMhO6cxsJANZiHsEE
POca3avy+EC1Xgf4hvT8cDu4fm/jlcwYowIDAQABAkArbHbXzhM/32ffJbvChGE1
n4UieYy8OrZ4pRg8kt453XZZevTByA+e4DSgaVjgdG+jeMKFKvjPQtGmO7TPOWep
AiEA4U2EQKhIJzaN3n7p9r0ZgRlfk7YxFSANcenPtzFXSFcCIQCIQr0FssmVHZC4
wUqxcWPDvnS+M78rBjmi0FTBylIylQIgXUANLgm4m2pL+7wBsBsCVFmhImz1Ea5L
gktoqoTkgE8CIEKfvySGIqJSbmyntgnE027mNNa7HoG+7Xd6PbbzYfVxAiEAmbln
WKxCvj+Wz1b6FZXi8+8rlJWvUjxjxzsVGU4yIUc=
-----END RSA PRIVATE KEY-----`

const ACCESS_LEVEL = {
  PUBLIC: 0,
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3
}

const mapRoleToAccessLevel = role => {
  switch (role) {
    case "User": return 1;
    case "Moderator": return 2;
    case "Admin": return 3;
    default: return 0;
  }
}

const { Pool } = require("pg");

const credentials = {
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "admin",
  port: 5432
};

app.listen(port, () => console.log(`Listening on port ${process?.env?.PORT || 5000}`));

app.use(express.static(`${__dirname}/public`));
app.use(express.json());

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/manifest.json'));
});

app.get('/image', (req, res) => {
  console.log(req.query.id);
});

const validateEmail = email => {
  const re = /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/;
  return re.test(email) && email.length <= 320;
}

const validateUsername = username => {
  const re = /^[a-z0-9_-]{3,32}$/i;
  return re.test(username);
}

const validateYear = year => {
  return year >= 1950 && year <= new Date().getFullYear();
}

const isUserAuth = (headers, accessLevel, username) => {
  let decodedToken;

  try {
    const token = headers.authorization.split(" ")[1];
    decodedToken = jwt.verify(token, TOKEN_KEY);
    console.log("DT", decodedToken);
  } catch (err) {
    console.log("Invalid token");
  }

  if (username && decodedToken.user_id !== username) {
    return false;
  }

  if (accessLevel > 0) {
    if (!decodedToken?.user_id) {
      return false;
    }

    if (accessLevel > mapRoleToAccessLevel(decodedToken?.role)) {
      return false;
    }
  }

  return true;
}

const handleGetRequest = async (req, res, accessLevel, sqlString, sqlArguments) => {
  let { sortIndex, sortDirection, page, perPage } = req.query;
  let decodedToken;

  try {
    const token = req.headers.authorization.split(" ")[1];
    decodedToken = jwt.verify(token, TOKEN_KEY);
  } catch (err) {
    console.log("Invalid token");
  }

  if (accessLevel > 0) {
    if (!decodedToken?.user_id) {
      return res.status(401).send("Authorization is required");
    }

    if (accessLevel > mapRoleToAccessLevel(decodedToken?.role)) {
      return res.status(403).send("Forbidden");
    }
  }

  // sql injection prevention
  sortIndex = parseInt(sortIndex)
  page = parseInt(page)
  perPage = parseInt(perPage)

  if (!Number.isInteger(sortIndex)) {
    sortIndex = 0;
  }

  if (!Number.isInteger(page)) {
    page = 1;
  }

  if (!Number.isInteger(perPage)) {
    perPage = 20;
  }

  if (!['asc', 'desc'].includes(sortDirection?.toLowerCase())) {
    sortDirection = 'asc';
  }

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`${sqlString} ORDER BY ${sortIndex + 1} ${sortDirection} LIMIT ${perPage} OFFSET ${perPage * (page - 1)};`, sqlArguments);
  await pool.end();

  const itemCount = dbRes.rows?.[0]?.item_count ?? 0;

  dbRes.rows = dbRes.rows.map(row => {
    if (row.hasOwnProperty('item_count')) {
      const { item_count, ...rest } = row;
      return rest
    }
    else {
      return row;
    }
  });

  const dbResList = dbRes.rows.map(row => Object.values(row));

  res.send({
    data: dbResList,
    meta: {
      itemCount
    }
  });
}

app.get('/allCourses', async (req, res) => {
  const username = req.query.username;

  if (username) {
    handleGetRequest(req, res, ACCESS_LEVEL.PRIVATE, `SELECT C.course_name, COUNT(question_id), C.course_description, C.last_activity, C.course_id, count(*) OVER() AS item_count,
                                                    (SELECT count(*) FROM REGISTERED_COURSES RC WHERE RC.course_id = C.course_id AND RC.user_id=(
                                                      SELECT user_id FROM USERS WHERE username = $1
                                                    )) = 1 OR C.mentor_id = (SELECT user_id FROM USERS WHERE username = $1) is_registered
                                                    FROM COURSES C
                                                    LEFT JOIN QUESTIONS Q ON C.course_id=Q.course_id
                                                    WHERE C.is_approved = TRUE
                                                    GROUP BY C.course_id, C.course_name, C.course_description, C.last_activity`, [username])
  }
  else {
    handleGetRequest(req, res, ACCESS_LEVEL.PUBLIC, `SELECT C.course_name, COUNT(question_id), C.course_description, C.last_activity, C.course_id, count(*) OVER() AS item_count
                              FROM COURSES C
                              LEFT JOIN QUESTIONS Q ON C.course_id=Q.course_id
                              WHERE C.is_approved = TRUE
                              GROUP BY C.course_id, C.course_name, C.course_description, C.last_activity`)
  }
});

app.get('/myCourses', async (req, res) => {
  handleGetRequest(req, res, ACCESS_LEVEL.PRIVATE, `SELECT C.course_name, COUNT(question_id), C.course_description, C.last_activity, C.course_id, count(*) OVER() AS item_count
                                                    FROM COURSES C
                                                    LEFT JOIN QUESTIONS Q ON C.course_id=Q.course_id
                                                    INNER JOIN REGISTERED_COURSES RC ON C.course_id = RC.course_id 
                                                    WHERE RC.user_id = (SELECT user_id FROM USERS WHERE username = $1) AND RC.is_accepted = TRUE
                                                    GROUP BY C.course_id, C.course_name, C.course_description, C.last_activity`, [req.query.username])
});

app.get('/managedCourses', async (req, res) => {
  const username = req.query.user;

  handleGetRequest(req, res, ACCESS_LEVEL.PRIVATE, `SELECT C.course_name, COUNT(question_id), C.course_description, C.last_activity, C.course_id, count(*) OVER() AS item_count
                                                    FROM COURSES C
                                                    LEFT JOIN QUESTIONS Q ON C.course_id=Q.course_id
                                                    LEFT JOIN USERS U ON U.user_id=C.mentor_id
                                                    WHERE username = $1 AND C.is_approved = TRUE
                                                    GROUP BY C.course_id, C.course_name, C.course_description, C.last_activity`, [username])
});

app.get('/coursesToApprove', async (req, res) => {
  handleGetRequest(req, res, ACCESS_LEVEL.MODERATOR, `SELECT C.course_name, C.creation_date, C.course_id, count(*) OVER() AS item_count
                                                      FROM COURSES C LEFT JOIN QUESTIONS Q ON C.course_id=Q.course_id
                                                      WHERE C.is_approved = FALSE
                                                      GROUP BY C.course_name, C.creation_date, C.course_id`)
})

app.get('/categories', async (req, res) => {
  handleGetRequest(req, res, ACCESS_LEVEL.PUBLIC, `SELECT CATEGORY_name, COUNT(Q.question_id) qCount, COUNT(A.answer_id) aCount, count(*) OVER() AS item_count
                                                      FROM QUESTIONS Q
                                                      LEFT JOIN ANSWERS A ON Q.question_id=A.parent_question
                                                      RIGHT JOIN CATEGORIES C ON C.category_id = Q.category_id
                                                      GROUP BY CATEGORY_name`)
})

app.get('/courseQuestions', async (req, res) => {
  const course = req.query.course;
  const search = req.query.search ? "%" + req.query.search + "%" : "%";

  handleGetRequest(req, res, ACCESS_LEVEL.PUBLIC, `SELECT Q.is_closed, U.preferred_badge, Q.title, Cat.category_name, U.username, COUNT(answer_id) answers, Q.creation_date, Q.last_activity, Q.question_id, count(*) OVER() AS item_count
                                                  FROM QUESTIONS Q LEFT JOIN USERS U on Q.user_id=U.user_id
                                                  LEFT JOIN ANSWERS A ON Q.question_id=A.parent_question
                                                  LEFT JOIN COURSES C ON C.course_id=Q.course_id
                                                  LEFT JOIN CATEGORIES Cat ON Cat.category_id=Q.category_id
                                                  WHERE C.course_id=$1 AND Q.title LIKE $2
                                                  GROUP BY question_id, u.username, Q.is_closed, Q.title, Cat.category_name, U.username, U.preferred_badge, Q.votes, Q.creation_date, Q.last_activity`, [course, search])
})

app.get('/answers', async (req, res) => {
  const question = req.query.question;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`WITH vts AS (
                                  SELECT V.answer_id,
                                  SUM (CASE V.vote_voted
                                    WHEN 'upvote' THEN 1
                                    WHEN 'downvote' THEN -1
                                    END) AS votes
                                  FROM VOTED V
                                  GROUP BY V.answer_id)
                                SELECT U.username, A.creation_date, A.text_data, A.parent_answer, COALESCE(v.votes, 0), A.accepted, A.image_data, A.answer_id, U.preferred_badge, count(*) OVER() AS item_count
                                FROM ANSWERS A
                                LEFT JOIN USERS U on A.user_id=U.user_id
                                LEFT JOIN QUESTIONS Q ON Q.question_id=A.parent_question
                                LEFT JOIN vts V ON A.answer_id=V.answer_id
                                WHERE Q.question_id=$1;`, [question])
  await pool.end();

  const itemCount = dbRes.rows?.[0]?.item_count ?? 0;

  dbRes.rows = dbRes.rows.map(row => {
    if (row.hasOwnProperty('item_count')) {
      const { item_count, ...rest } = row;
      return rest
    }
    else {
      return row;
    }
  });

  const dbResList = dbRes.rows.map(row => Object.values(row));

  res.send({
    data: dbResList,
    meta: {
      itemCount
    }
  });
})

app.get('/questionDetail', async (req, res) => {
  const question = req.query.question;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT Q.title, Q.text_data description, Q.votes points, U.username author, U.preferred_badge, Q.is_closed
                                  FROM QUESTIONS Q
                                  LEFT JOIN USERS U on Q.user_id=U.user_id
                                  WHERE Q.question_id=$1;`, [question]);
  await pool.end();
  res.send(dbRes.rows[0]);
})

app.get('/allUsers', async (req, res) => {
  handleGetRequest(req, res, ACCESS_LEVEL.ADMIN, `WITH quest AS (
    SELECT U.user_id, COUNT(Q.question_id) questions
      FROM USERS U
      LEFT JOIN QUESTIONS Q ON U.user_id=Q.user_id
      GROUP BY U.user_id),
    answ AS (
      SELECT U.user_id, COUNT(A.answer_id) answers
      FROM USERS U
      LEFT JOIN ANSWERS A ON U.user_id=A.user_id
    GROUP BY U.user_id)
      SELECT U.preferred_badge, U.username, U.email, Q.questions questions, A.answers answers, U.points, U.first_login, U.role, U.most_recent_login, count(*) OVER() AS item_count
      FROM USERS U
      LEFT JOIN quest Q ON U.user_id=Q.user_id
      LEFT JOIN answ A ON U.user_id=A.user_id
      GROUP BY U.user_id, Q.questions, A.answers, U.username, U.points, U.first_login, U.role, U.most_recent_login`);
})

app.get('/getLadders', async (req, res) => {
  const course = req.query.course;

  if (course) {
    handleGetRequest(req, res, ACCESS_LEVEL.PUBLIC, `WITH quest AS (
      SELECT U.user_id, Q.course_id, COUNT(Q.question_id) questions
        FROM USERS U
        LEFT JOIN QUESTIONS Q ON U.user_id=Q.user_id
        GROUP BY U.user_id, Q.course_id),
      answ AS (
        SELECT U.user_id, COUNT(A.answer_id) answers
        FROM USERS U
        LEFT JOIN ANSWERS A ON U.user_id=A.user_id
        GROUP BY U.user_id)
      SELECT U.preferred_badge, U.username, Q.questions questions, A.answers answers, count(*) OVER() AS item_count
        FROM USERS U
        LEFT JOIN quest Q ON U.user_id=Q.user_id
        LEFT JOIN answ A ON U.user_id=A.user_id
        WHERE Q.course_id = (SELECT course_id FROM COURSES WHERE course_id = $1)
        GROUP BY U.user_id, Q.questions, A.answers, U.username, U.preferred_badge, U.points`, [course]);
  }
  else {
    handleGetRequest(req, res, ACCESS_LEVEL.PUBLIC, `WITH quest AS (
      SELECT U.user_id, COUNT(Q.question_id) questions
      FROM USERS U
      LEFT JOIN QUESTIONS Q ON U.user_id=Q.user_id
      GROUP BY U.user_id),
      answ AS (
        SELECT U.user_id, COUNT(A.answer_id) answers
        FROM USERS U
        LEFT JOIN ANSWERS A ON U.user_id=A.user_id
        GROUP BY U.user_id)
        SELECT U.preferred_badge, U.username, U.points, Q.questions questions, A.answers answers, count(*) OVER() AS item_count
        FROM USERS U
        LEFT JOIN quest Q ON U.user_id=Q.user_id
        LEFT JOIN answ A ON U.user_id=A.user_id
        GROUP BY U.user_id, Q.questions, A.answers, U.username, U.preferred_badge, U.points`);
  }
})

app.get('/getWaiting', async (req, res) => {
  const mentor = req.query.mentor;

    handleGetRequest(req, res, ACCESS_LEVEL.USER, `SELECT U.preferred_badge, U.username, U.email, C.course_name FROM REGISTERED_COURSES RC JOIN COURSES C ON RC.course_id = C.course_id JOIN USERS U ON U.user_id = RC.user_id WHERE C.mentor_id = (SELECT user_id FROM USERS WHERE username = $1) AND RC.is_accepted = FALSE`, [mentor]);
});

app.get('/userInfo', async (req, res) => {
  let { user } = req.query;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`WITH quest AS (
    SELECT U.user_id, COUNT(Q.question_id) questions
      FROM USERS U
      LEFT JOIN QUESTIONS Q ON U.user_id=Q.user_id
      GROUP BY U.user_id),
    answ AS (
      SELECT U.user_id, COUNT(A.answer_id) answers
      FROM USERS U
      LEFT JOIN ANSWERS A ON U.user_id=A.user_id
    GROUP BY U.user_id)
    SELECT U.username, U.study_start, U.points, Q.questions question_count, A.answers answer_count, U.role, U.first_login, U.most_recent_login, U.preferred_badge
            FROM USERS U LEFT JOIN quest Q ON U.user_id=Q.user_id LEFT JOIN answ A ON U.user_id=A.user_id
            WHERE U.username = $1;`, [user]);
  await pool.end();

  const itemCount = dbRes.rowCount;

  if (itemCount === 0) {
    return res.status(404).send("Používateľ neexistuje");
  }

  res.send(dbRes.rows[0]);
})

app.get('/isRegistered', async (req, res) => {
  let { user, courseId } = req.query;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT * FROM REGISTERED_COURSES WHERE course_id = $1 AND user_id = (SELECT user_id FROM USERS WHERE username = $2) AND is_accepted = TRUE;`, [courseId, user]);
  await pool.end();

  const itemCount = dbRes.rowCount;

  res.status(200).send(itemCount > 0);
})

app.get('/userVotesInQuestion', async (req, res) => {
  let { user, question } = req.query;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT V.user_id,  A.parent_question, V.vote_voted
                                  from VOTED V LEFT JOIN ANSWERS A ON V.answer_id=A.answer_id
                                  WHERE A.parent_question = (SELECT question_id FROM QUESTIONS WHERE title = $1) AND V.user_id = (SELECT user_id FROM USERS WHERE username = $2)`, [question, user]);
  await pool.end();

  res.send(dbRes.rows[0]);
})

app.get('/isMentor', async (req, res) => {
  let { user, courseId } = req.query;

  let dbRes;

  const pool = new Pool(credentials);
  
  if (courseId) {
    dbRes = await pool.query(`SELECT * FROM COURSES WHERE course_id = $1 AND mentor_id = (SELECT user_id FROM USERS WHERE username = $2);`, [courseId, user]);
  }
  else {
    dbRes = await pool.query(`SELECT * FROM COURSES WHERE mentor_id = (SELECT user_id FROM USERS WHERE username = $1);`, [user]);
  }

  await pool.end();

  const itemCount = dbRes.rowCount;

  res.status(200).send(itemCount > 0);
})

app.get('/hasUserAnswered', async (req, res) => {
  let { user, question } = req.query;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT * FROM ANSWERS WHERE parent_question = $1 AND parent_answer IS NULL AND user_id = (SELECT user_id FROM USERS WHERE username = $2);`, [question, user]);
  await pool.end();

  const itemCount = dbRes.rowCount;

  res.status(200).send(itemCount > 0);
})

app.get('/getUserVotesForQuestion', async (req, res) => {
  let { user, question } = req.query;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT V.vote_voted, V.answer_id FROM VOTED V INNER JOIN ANSWERS A ON A.answer_id = V.answer_id INNER JOIN QUESTIONS Q ON A.parent_question = Q.question_id WHERE V.user_id = (SELECT user_id FROM USERS WHERE username = $1) AND Q.question_id = $2`, [user, question]);
  await pool.end();

  res.send(dbRes.rows);
})

app.get('/getCourseName', async (req, res) => {
  let { courseId } = req.query;

  if (courseId === "undefined") {
    return;
  }

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT course_name FROM COURSES WHERE course_id = $1;`, [courseId]);
  await pool.end();

  res.send(dbRes?.rows[0]?.course_name);
})

app.get('/isCourseApproved', async (req, res) => {
  let { courseId } = req.query;

  if (courseId === "undefined") {
    return;
  }

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`SELECT is_approved FROM COURSES WHERE course_id = $1;`, [courseId]);
  await pool.end();

  res.send(dbRes?.rows[0]?.is_approved);
})


app.get('/achievements', async (req, res) => {
  let { user } = req.query;

  const pool = new Pool(credentials);
  const dbRes = await pool.query(`WITH created_course_cnt AS(
         SELECT U.user_id, COUNT(C.course_id) courses_created
         FROM USERS U
         LEFT JOIN COURSES C ON U.user_id=C.mentor_id
         GROUP BY U.user_id ),
     registered_course_cnt AS(
         SELECT U.user_id, COUNT(C.course_id) courses_registered
         FROM USERS U
         LEFT JOIN REGISTERED_COURSES C ON U.user_id=C.user_id
         GROUP BY U.user_id ),
     questions_cnt AS (
         SELECT U.user_id, COUNT(Q.question_id) questions
         FROM USERS U
         LEFT JOIN QUESTIONS Q ON U.user_id=Q.user_id
         GROUP BY U.user_id),
     answers_cnt AS (
         SELECT U.user_id, COUNT(A.answer_id) answers
         FROM USERS U
         LEFT JOIN ANSWERS A ON U.user_id=A.user_id
         GROUP BY U.user_id),
     accepted_cnt AS (
         SELECT U.user_id, COUNT(A.answer_id) accepted
         FROM USERS U
         LEFT JOIN ANSWERS A ON U.user_id=A.user_id
         WHERE A.accepted =true
         GROUP BY U.user_id)
     SELECT U.username, Q.questions questions, A.answers answers, AC.accepted accepted, C.courses_created courses_created, R.courses_registered courses_registered, U.points
     FROM USERS U
     LEFT JOIN questions_cnt Q ON U.user_id=Q.user_id
     LEFT JOIN answers_cnt A ON U.user_id=A.user_id
     LEFT JOIN accepted_cnt AC ON U.user_id=AC.user_id
     LEFT JOIN created_course_cnt C ON U.user_id=C.user_id
     LEFT JOIN registered_course_cnt R ON U.user_id=R.user_id
     WHERE U.username = $1
     GROUP BY U.username, Q.questions, A.answers, AC.accepted, C.courses_created, R.courses_registered, U.points;`, [user]);
  await pool.end();

  const itemCount = dbRes.rowCount;

  if (itemCount === 0) {
    return res.status(404).send("Používateľ neexistuje");
  }

  res.send(dbRes.rows[0]);
})

app.post('/removeUser', async (req, res) => {
  const userToRemove = req.body.user;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.ADMIN)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`DELETE FROM USERS WHERE username = $1;`, [userToRemove]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to delete user ${userToRemove}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/acceptUser', async (req, res) => {
  const userToAccept = req.body.userToAccept;
  const courseName = req.body.courseName;
  const verdict = req.body.verdict;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);

    if (verdict === "yes") {
      await pool.query(`UPDATE REGISTERED_COURSES SET is_accepted = TRUE WHERE course_id = (SELECT course_id FROM COURSES WHERE course_name = $1) AND user_id = (SELECT user_id FROM USERS WHERE username = $2);`, [courseName, userToAccept]);
    }
    else {
      await pool.query(`DELETE FROM REGISTERED_COURSES WHERE course_id = (SELECT course_id FROM COURSES WHERE course_name = $1) AND user_id = (SELECT user_id FROM USERS WHERE username = $2);`, [courseName, userToAccept]);
    }
  
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to accept/reject user ${userToAccept}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/removeCategory', async (req, res) => {
  const categoryToRemove = req.body.category;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`DELETE FROM CATEGORIES WHERE category_name = $1;`, [categoryToRemove]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to delete category ${categoryToRemove}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/addCategory', async (req, res) => {
  const categoryToAdd = req.body.category;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`INSERT INTO CATEGORIES VALUES (DEFAULT, $1);`, [categoryToAdd]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to add category ${categoryToAdd}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/addQuestion', async (req, res) => {
  const courseId = req.body.courseName;
  const questionTitle = req.body.questionTitle;
  const questionBody = req.body.questionBody;
  const categoryName = req.body.categoryName;
  const authorName = req.body.authorName;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, authorName)) {
    return res.status(403).send("Forbidden");
  }

  try {    
    const pool = new Pool(credentials);

    const dbRes = await pool.query(`SELECT * FROM COURSES C LEFT JOIN REGISTERED_COURSES R ON C.course_id = R.course_id WHERE C.course_id = $1 AND R.user_id = (SELECT user_id FROM USERS WHERE username = $2);`, [courseId, authorName]);
    const itemCount = dbRes.rowCount;

    if (itemCount === 0) {
      return res.status(403).send("Forbidden");
    }

    await pool.query(`INSERT INTO QUESTIONS VALUES (
                      DEFAULT,
                      $1,
                      $2,
                      (SELECT user_id FROM USERS WHERE username = $3),
                      (SELECT category_id FROM CATEGORIES WHERE category_name = $4),
                      DEFAULT,
                      $5,
                      DEFAULT,
                      DEFAULT
                      );`, [questionTitle, courseId, authorName, categoryName, questionBody]);
    await pool.query(`UPDATE COURSES SET last_activity = CURRENT_TIMESTAMP WHERE course_id = (SELECT course_id FROM COURSES WHERE course_id = $1);`, [courseId]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to add question: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/addAnswer', async (req, res) => {
  const file = req.body.file;
  const text = req.body.text;
  const questionName = req.body.questionName;
  const authorName = req.body.authorName;
  const responseId = req.body.responseId;
  const courseId = req.body.courseId;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, authorName)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);    
    if (responseId) {
      if (file) {
        await pool.query(`INSERT INTO ANSWERS VALUES (
          DEFAULT,
          $1,
          $2,
          (SELECT user_id FROM USERS WHERE username = $3),
          $4,
          DEFAULT,
          DEFAULT,
          $5
          );`, [questionName, responseId, authorName, text, file]);
      }
      else {
        await pool.query(`INSERT INTO ANSWERS VALUES (
          DEFAULT,
          $1,
          $2,
          (SELECT user_id FROM USERS WHERE username = $3),
          $4,
          DEFAULT,
          DEFAULT,
          DEFAULT
          );`, [questionName, responseId, authorName, text]);
      }
    }
    else {
      if (file) {
        await pool.query(`INSERT INTO ANSWERS VALUES (
          DEFAULT,
          $1,
          NULL,
          (SELECT user_id FROM USERS WHERE username = $2),
          $3,
          DEFAULT,
          DEFAULT,
          $4
          );`, [questionName, authorName, text, file]);
      }
      else {
        await pool.query(`INSERT INTO ANSWERS VALUES (
          DEFAULT,
          $1,
          NULL,
          (SELECT user_id FROM USERS WHERE username = $2),
          $3,
          DEFAULT,
          DEFAULT,
          DEFAULT
          );`, [questionName, authorName, text]);
      }
    }
    await pool.query(`UPDATE COURSES SET last_activity = CURRENT_TIMESTAMP WHERE course_id = (SELECT course_id FROM QUESTIONS WHERE title = $1);`, [questionName]);
    await pool.query(`UPDATE QUESTIONS SET last_activity = CURRENT_TIMESTAMP WHERE question_id = (SELECT question_id FROM QUESTIONS WHERE title = $1);`, [questionName]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to add question: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/subscribeCourse', async (req, res) => {
  const course = req.body.course;
  const username = req.body.username;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, username)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`INSERT INTO REGISTERED_COURSES VALUES
                      ((SELECT user_id FROM USERS WHERE username = $1),
                      (SELECT course_id FROM COURSES WHERE course_name = $2)
                      );`, [username, course]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to subscribe to course ${course}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/unsubscribeCourse', async (req, res) => {
  const course = req.body.course;
  const username = req.body.username;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, username)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`DELETE FROM REGISTERED_COURSES RC
                      WHERE RC.user_id = (SELECT user_id FROM USERS WHERE username = $1)
                      AND
                      RC.course_id = (SELECT course_id FROM COURSES WHERE course_name = $2)
                      ;`, [username, course]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to unsubscribe from course ${course}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/approveCourse', async (req, res) => {
  const courseToApprove = req.body.course;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.MODERATOR)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`UPDATE COURSES SET is_approved = TRUE WHERE course_name = $1;`, [courseToApprove]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to approve course ${courseToApprove}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/rejectCourse', async (req, res) => {
  const courseToReject = req.body.course;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.MODERATOR)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`DELETE FROM COURSES WHERE course_name = $1;`, [courseToReject]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to reject course ${courseToReject}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/createNewCourse', async (req, res) => {
  const courseName = req.body.courseName;
  const courseDescription = req.body.courseDescription;
  const courseMentor = req.body.username;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, courseMentor)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`INSERT INTO COURSES VALUES(DEFAULT, $1, (SELECT user_id FROM USERS WHERE username = $2), DEFAULT, $3);`, [courseName, courseMentor, courseDescription]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to create a new course ${courseName}: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/setPreferredBadge', async (req, res) => {
  const username = req.body.username;
  const badge = req.body.badge;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, username)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`UPDATE USERS SET preferred_badge = $1 WHERE username = $2;`, [badge, username]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed set preferred badge: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/vote', async (req, res) => {
  const username = req.body.username;
  const answerId = req.body.answerId;
  const value = req.body.value;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, username)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`INSERT INTO VOTED (vote_voted, user_id, answer_id) VALUES ($1, (SELECT user_id FROM USERS WHERE username = $2), $3) ON CONFLICT (user_id, answer_id) DO UPDATE SET vote_voted = $1;`, [value, username, answerId]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to add vote: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/acceptAnswer', async (req, res) => {
  const answerId = req.body.answerId;
  const points = req.body.points;
  const author = req.body.author;
  const mentor = req.body.mentor;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER, mentor)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);

    // check if user is mentor
    const dbRes = await pool.query(`SELECT * FROM COURSES C JOIN QUESTIONS Q ON Q.course_id = C.course_id JOIN ANSWERS A ON A.parent_question = Q.question_id WHERE A.answer_id = $1 AND mentor_id=(SELECT user_id FROM USERS WHERE username = $2);`, [answerId, mentor]);

    const itemCount = dbRes.rowCount;

    if (itemCount === 0) {
      return res.status(403).send("Forbidden");
    }

    await pool.query(`UPDATE ANSWERS SET accepted = TRUE WHERE answer_id = $1;`, [answerId]);
    await pool.query(`UPDATE USERS SET points = points + $1 WHERE user_id = (SELECT user_id FROM USERS WHERE username = $2);`, [points, author]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to accept answer: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/closeQuestion', async (req, res) => {
  const user = req.body.user;
  const points = req.body.points;
  const answer = req.body.answer;
  const questionName = req.body.questionName;

  if (!isUserAuth(req.headers, ACCESS_LEVEL.USER)) {
    return res.status(403).send("Forbidden");
  }

  try {
    const pool = new Pool(credentials);

    // check if user is mentor
    const dbRes = await pool.query(`SELECT * FROM COURSES C JOIN QUESTIONS Q ON Q.course_id = C.course_id WHERE Q.question_id = $1 AND mentor_id=(SELECT user_id FROM USERS WHERE username = $2);`, [questionName, user]);

    const itemCount = dbRes.rowCount;
    
    if (itemCount === 0) {
      return res.status(403).send("Forbidden");
    }
    
    await pool.query(`UPDATE COURSES SET last_activity = CURRENT_TIMESTAMP WHERE course_id = (SELECT course_id FROM QUESTIONS WHERE question_id = $1);`, [questionName]);
    await pool.query(`UPDATE QUESTIONS SET last_activity = CURRENT_TIMESTAMP WHERE question_id = (SELECT question_id FROM QUESTIONS WHERE question_id = $1);`, [questionName]);

    // add answer (accepted)
    await pool.query(`INSERT INTO ANSWERS VALUES (
      DEFAULT,
      $1,
      NULL,
      (SELECT user_id FROM USERS WHERE username = $2),
      $3,
      DEFAULT,
      TRUE,
      DEFAULT
      );`, [questionName, user, answer]);

    // set question closed
    await pool.query(`UPDATE QUESTIONS SET is_closed = TRUE WHERE question_id = $1`, [questionName]);

    // add bonus points
    await pool.query(`UPDATE USERS SET points = points + $1 WHERE user_id in (SELECT U.user_id from QUESTIONS Q LEFT JOIN ANSWERS A ON Q.question_id = A.parent_question
                      LEFT JOIN USERS U ON A.user_id = U.user_id
                      WHERE Q.question_id = $2 AND A.accepted = true);`, [points, questionName]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    console.error(`Failed to accept answer: ${error}`)
    res.sendStatus(400);
  }
})

app.post('/register', async (req, res) => {
  const username = req.body.user;
  const email = req.body.email;
  const hashedPassword = req.body.password;
  const startYear = req.body.startYear;

  if (!validateEmail(email)) {
    return res.status(400).send("Neplatný email");
  }

  if (!validateUsername(username)) {
    return res.status(400).send("Neplatné používateľské meno");
  }

  if (!validateYear(startYear)) {
    return res.status(400).send("Neplatný rok začiatku štúdia");
  }

  let dbRes;

  try {
    const pool = new Pool(credentials);
    dbRes = await pool.query(`SELECT * FROM users WHERE LOWER(username) = LOWER($1) or LOWER(email) = LOWER($2);`, [username, email]);
    await pool.end();
  }
  catch (error) {
    return res.status(400).send("Registrácia neúspešná");
  }

  const itemCount = dbRes.rowCount;

  if (itemCount > 0) {
    return res.status(400).send("Prihlasovacie meno alebo email je obsadený");
  }

  try {
    const pool = new Pool(credentials);
    await pool.query(`INSERT INTO USERS VALUES(DEFAULT, $1, $2, 'User', DEFAULT, DEFAULT, DEFAULT, $3, DEFAULT, $4);`, [username, hashedPassword, startYear, email]);
    await pool.end();
    res.sendStatus(200);
  }
  catch (error) {
    return res.status(400).send("Registrácia neúspešná");
  }
})

app.post('/login', async (req, res) => {
  const username = req.body.user;
  const enteredPassword = req.body.password;

  let dbRes;

  try {
    const pool = new Pool(credentials);
    dbRes = await pool.query(`SELECT username, pswd, role FROM users WHERE LOWER(username) = LOWER($1);`, [username]);
    await pool.end();
  }
  catch (error) {
    return res.status(400).send("Prihlásenie neúspešné");
  }

  const itemCount = dbRes.rowCount;

  if (itemCount === 0) {
    return res.status(401).send("Používateľ s daným menom neexistuje");
  }
  else {
    const correctHashedPassword = dbRes.rows[0].pswd;
    const role = dbRes.rows[0].role;

    await bcrypt.compare(enteredPassword, correctHashedPassword, async function (err, resolution) {
      if (err) {
        console.error(`Failed to login user`);
        res.sendStatus(400);
      }
      if (resolution) {
        const token = jwt.sign(
          { user_id: dbRes.rows[0].username, role },
          TOKEN_KEY,
          {
            expiresIn: "48h",
          }
        );

        const pool = new Pool(credentials);
        await pool.query(`UPDATE USERS SET most_recent_login = CURRENT_TIMESTAMP WHERE username = $1;`, [username]);
        await pool.end();

        res.status(200).json({ username: dbRes.rows[0].username, token, role: dbRes.rows[0].role });
      }
      else {
        return res.status(401).send("Nesprávne heslo");
      }
    });
  }
})

app.use('/', express.static('./build'));
app.use('/*', express.static('./build'));
