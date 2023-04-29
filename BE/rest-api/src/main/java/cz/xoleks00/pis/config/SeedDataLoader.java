package cz.xoleks00.pis.config;

import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.Person;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import jakarta.transaction.UserTransaction;

import jakarta.annotation.Resource;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.mindrot.jbcrypt.BCrypt;

@WebListener
public class SeedDataLoader implements ServletContextListener {

    @PersistenceContext(unitName = "jpa-unit")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        seedData();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // No action necessary
    }

    public void seedData() {
        try {
            utx.begin();
            em.joinTransaction();

            // Check if the database is empty
            List<Person> persons = em.createQuery("SELECT p FROM Person p", Person.class).getResultList();
            if (persons.isEmpty()) {
                // Seeding persons
                Person person1 = new Person();
                person1.setName("John Doe");                
                person1.setUsername("johnko");
                person1.setEmail("john.doe@example.com");
                person1.setPassword(BCrypt.hashpw("pswd", BCrypt.gensalt()));
                person1.setUserCreated(new Date());
                person1.setAdmin(true);
                em.persist(person1);

                Person person2 = new Person();
                person2.setName("Samo Jarovic");                
                person2.setUsername("samoo");
                person2.setEmail("samo.samovic@example.com");
                person2.setPassword(BCrypt.hashpw("pswd", BCrypt.gensalt()));
                person2.setUserCreated(new Date());
                person2.setAdmin(false);
                em.persist(person2);

                Person person3 = new Person();
                person3.setName("Michal Michalovic");                
                person3.setUsername("michall");
                person3.setEmail("michal.michalovic@example.com");
                person3.setPassword(BCrypt.hashpw("pswd", BCrypt.gensalt()));
                person3.setUserCreated(new Date());
                person3.setAdmin(false);
                em.persist(person3);

                Person[] people = new Person[10];
                for (int i = 0; i < 10; i++) {
                    Person person = new Person();
                    person.setName("Name" + (i + 1) + " Surname");                    
                    person.setUsername("user" + (i + 1));
                    person.setEmail("email" + (i + 1) + "@example.com");
                    person.setPassword(BCrypt.hashpw("pswd" + (i + 1), BCrypt.gensalt()));
                    person.setUserCreated(new Date());
                    person.setAdmin(false);
                    em.persist(person);
                    people[i] = person;
                }

                // Seeding events
                Event event1 = new Event();
                event1.setCreator(person1);
                event1.setDescription("Event 1");
                event1.setStart(new Date());
                event1.setEnd(new Date());
                event1.setAttendees(Arrays.asList(person2, person3));
                em.persist(event1);

                Event event2 = new Event();
                event2.setCreator(person2);
                event2.setDescription("Event 2");
                event2.setStart(new Date());
                event2.setEnd(new Date());
                event2.setAttendees(Arrays.asList(person1, person3));
                em.persist(event2);

                Event event3 = new Event();
                event3.setCreator(person2);
                event3.setDescription("Event 3");
                event3.setStart(new Date());
                event3.setEnd(new Date());
                event3.setAttendees(Arrays.asList(person1, person3));
                em.persist(event3);

                Event event4 = new Event();
                event4.setCreator(person2);
                event4.setDescription("Event 4");
                event4.setStart(new Date());
                event4.setEnd(new Date());
                event4.setAttendees(Arrays.asList(person1, person3));
                em.persist(event4);

                

                // Associate events with persons
                person1.getEvents().add(event1);
                person2.getEvents().add(event2);
                person2.getEvents().add(event3);
                person2.getEvents().add(event4);

                Calendar calendar = Calendar.getInstance();
                calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);

                for (int i = 0; i < 5; i++) {
                    Event event = new Event();
                    event.setCreator(people[i]);
                    event.setDescription("Event " + (i + 1));
                    event.setStart(calendar.getTime());
                    calendar.add(Calendar.HOUR_OF_DAY, 2);
                    event.setEnd(calendar.getTime());
                    event.setAttendees(Arrays.asList(people[i], people[i + 1], people[i + 2]));
                    em.persist(event);

                    // Add event to attendees
                    for (int j = 0; j < 3; j++) {
                        people[i + j].getEvents().add(event);
                    }

                    // Move to the next day
                    calendar.add(Calendar.DAY_OF_WEEK, 1);
                }
            }

            utx.commit();
        } catch (Exception e) {
            e.printStackTrace();
            try {
                utx.rollback();
            } catch (Exception rollbackException) {
                rollbackException.printStackTrace();
            }
        }
    }
}
