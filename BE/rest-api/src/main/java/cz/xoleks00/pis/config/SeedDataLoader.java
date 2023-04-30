package cz.xoleks00.pis.config;

import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.EventColor;
import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.data.UserRole;
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
            List<PISUser> users = em.createQuery("SELECT p FROM PISUser p", PISUser.class).getResultList();
            if (users.isEmpty()) {
                // Seeding users
                PISUser user1 = new PISUser();
                user1.setName("John Doe");                
                user1.setUsername("johnko");
                user1.setEmail("john.doe@example.com");
                user1.setPassword("pswd");
                user1.setUserCreated(new Date());
                user1.setAdmin(true);
                user1.setUserRole(UserRole.DIRECTOR);
                em.persist(user1);

                PISUser user2 = new PISUser();
                user2.setName("Samo Jarovic");                
                user2.setUsername("samoo");
                user2.setEmail("samo.samovic@example.com");
                user2.setPassword("pswd");
                user2.setUserCreated(new Date());
                user2.setUserRole(UserRole.ASSISTANT);
                user2.setAdmin(false);
                em.persist(user2);

                PISUser user3 = new PISUser();
                user3.setName("Michal Michalovic");                
                user3.setUsername("michall");
                user3.setEmail("michal.michalovic@example.com");
                user3.setPassword("pswd");
                user3.setUserCreated(new Date());
                user3.setUserRole(UserRole.MANAGER);
                user3.setAdmin(false);
                em.persist(user3);

                PISUser[] people = new PISUser[10];
                for (int i = 0; i < 10; i++) {
                    PISUser PISUser = new PISUser();
                    PISUser.setName("Name" + (i + 1) + " Surname");                    
                    PISUser.setUsername("user" + (i + 1));
                    PISUser.setEmail("email" + (i + 1) + "@example.com");
                    PISUser.setPassword("pswd" + (i + 1));
                    PISUser.setUserCreated(new Date());
                    PISUser.setAdmin(false);
                    PISUser.setUserRole(UserRole.MANAGER);
                    em.persist(PISUser);
                    people[i] = PISUser;
                }

                // Seeding events
                Event event1 = new Event();
                event1.setCreator(user1);
                event1.setDescription("Event 1");
                event1.setStart(new Date());
                event1.setEnd(new Date());
                event1.setAttendees(Arrays.asList(user2, user3));
                event1.setColor(EventColor.BLUE);
                em.persist(event1);

                Event event2 = new Event();
                event2.setCreator(user2);
                event2.setDescription("Event 2");
                event2.setStart(new Date());
                event2.setEnd(new Date());
                event2.setAttendees(Arrays.asList(user1, user3));
                event2.setColor(EventColor.GREEN);
                em.persist(event2);

                Event event3 = new Event();
                event3.setCreator(user2);
                event3.setDescription("Event 3");
                event3.setStart(new Date());
                event3.setEnd(new Date());
                event3.setAttendees(Arrays.asList(user1, user3));
                event3.setColor(EventColor.YELLOW);
                em.persist(event3);

                Event event4 = new Event();
                event4.setCreator(user2);
                event4.setDescription("Event 4");
                event4.setStart(new Date());
                event4.setEnd(new Date());
                event4.setAttendees(Arrays.asList(user1, user3));
                event4.setColor(EventColor.RED);
                em.persist(event4);

                

                // Associate events with users
                user1.getEvents().add(event1);
                user2.getEvents().add(event2);
                user2.getEvents().add(event3);
                user2.getEvents().add(event4);

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
                    event.setColor(EventColor.BLUE);
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
