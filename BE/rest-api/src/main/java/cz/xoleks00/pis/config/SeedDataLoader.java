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
import java.util.Date;
import java.util.List;

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
                person1.setName("John");
                person1.setSurname("Doe");
                person1.setBorn(new Date());
                em.persist(person1);

                Person person2 = new Person();
                person2.setName("Samo");
                person2.setSurname("Samovic");
                person2.setBorn(java.sql.Date.valueOf("1993-08-03"));
                em.persist(person2);

                Person person3 = new Person();
                person3.setName("Michal");
                person3.setSurname("Samovic");
                person3.setBorn(java.sql.Date.valueOf("1993-08-03"));
                em.persist(person3);

                // Seeding events
                Event event1 = new Event();
                event1.setCreator(person1);
                event1.setDescription("Event 1");
                event1.setStart(new Date());
                event1.setEnd(new Date());
                em.persist(event1);

                Event event2 = new Event();
                event2.setCreator(person2);
                event2.setDescription("Event 2");
                event1.setStart(new Date());
                event1.setEnd(new Date());
                em.persist(event2);

                // Associate events with persons
                person1.getEvents().add(event1);
                person2.getEvents().add(event2);
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
