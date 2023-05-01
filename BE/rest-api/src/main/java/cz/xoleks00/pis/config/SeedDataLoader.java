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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
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
                String[] names = {"Director Miro", "Manager Ondro", "Manager Juro", "Manager Samo", "Manager Michal",
                                  "Assistant Jozefina", "Assistant Nadezda", "Assistant Julia", "Assistant Petronela", "Assistant Rozalia"};

                PISUser[] people = new PISUser[10];
                for (int i = 0; i < 10; i++) {
                    PISUser PISUser = new PISUser();
                    PISUser.setName(names[i]);
                    PISUser.setEmail("email" + (i + 1) + "@example.com");
                    PISUser.setPassword("secretpswd");
                    PISUser.setUserCreated(new Date());
                    
                    if (i == 0) {
                        PISUser.setUserRole(UserRole.DIRECTOR);
                        PISUser.setUsername("director");
                        PISUser.setAdmin(true);
                    } else if (i >= 1 && i <= 4) {
                        PISUser.setUserRole(UserRole.MANAGER);
                        PISUser.setUsername("manager" + i);
                        PISUser.setAdmin(false);
                    } else {
                        PISUser.setUserRole(UserRole.ASSISTANT);
                        PISUser.setUsername("assistant" + (i - 4));
                        PISUser.setAdmin(false);
                    }

                    em.persist(PISUser);
                    people[i] = PISUser;
                }

                // Assign secretaries to managers and director
                people[5].setManagedUsers(Arrays.asList(people[0].getUsername()));
                for (int i = 1; i <= 4; i++) {
                    people[i + 5].setManagedUsers(Arrays.asList(people[i].getUsername()));
                }


                // Generate events for a whole month
                LocalDate currentDate = LocalDate.now();
                LocalDate firstDayOfMonth = currentDate.withDayOfMonth(1);
                LocalDate lastDayOfMonth = firstDayOfMonth.with(TemporalAdjusters.lastDayOfMonth());
                List<LocalDate> managerStandupDays = new ArrayList<>();
                List<LocalDate> assistantStandupDays = new ArrayList<>();
                List<LocalDate> companyMeetingDays = new ArrayList<>();
                List<LocalDate> sprintPlanningDays = new ArrayList<>();
                List<LocalDate> oneOnOneDays = new ArrayList<>();
                List<LocalDate> codeFreezeDays = new ArrayList<>();
                List<LocalDate> spaDays = new ArrayList<>();
                List<LocalDate> homeOfficeDays = new ArrayList<>();
                List<LocalDate> checkServersDays = new ArrayList<>();
                
                LocalDate iteratorDate = firstDayOfMonth;
                while (!iteratorDate.isAfter(lastDayOfMonth)) {
                    if (iteratorDate.getDayOfWeek() != DayOfWeek.SATURDAY && iteratorDate.getDayOfWeek() != DayOfWeek.SUNDAY) {
                        managerStandupDays.add(iteratorDate);
                        assistantStandupDays.add(iteratorDate);
                
                        if (iteratorDate.getDayOfWeek() == DayOfWeek.FRIDAY) {
                            companyMeetingDays.add(iteratorDate);
                            codeFreezeDays.add(iteratorDate);
                        }
                
                        if (iteratorDate.getDayOfWeek() == DayOfWeek.MONDAY && iteratorDate.getDayOfMonth() % 14 == 1) {
                            sprintPlanningDays.add(iteratorDate);
                        }
                
                        if (iteratorDate.getDayOfWeek() != DayOfWeek.FRIDAY) {
                            oneOnOneDays.add(iteratorDate);
                        }
                
                        if (iteratorDate.getDayOfWeek() == DayOfWeek.WEDNESDAY) {
                            homeOfficeDays.add(iteratorDate);
                        }
                
                        checkServersDays.add(iteratorDate);
                    } else {
                        if (iteratorDate.getDayOfWeek() == DayOfWeek.SATURDAY) {
                            spaDays.add(iteratorDate);
                        }
                        if (iteratorDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
                            spaDays.add(iteratorDate);
                        }
                    }
                    iteratorDate = iteratorDate.plusDays(1);
                }


                // Create manager standup events
                for (LocalDate day : managerStandupDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(10, 0));
                    LocalDateTime endTime = LocalDateTime.of(day, LocalTime.of(10, 30));
                    createEvent("Manager Standup", startTime, endTime, people[0], Arrays.asList(people[1], people[2], people[3], people[4]), EventColor.BLUE);
                }

                // Create assistant standup events
                for (LocalDate day : assistantStandupDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(10, 30));
                    LocalDateTime endTime = LocalDateTime.of(day, LocalTime.of(11, 0));
                    createEvent("Assistant Standup", startTime, endTime, people[5], Arrays.asList(people[6], people[7], people[8], people[9]), EventColor.GREEN);
                }

                // Create company meeting events
                for (LocalDate day : companyMeetingDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(14, 0));
                    LocalDateTime endTime = LocalDateTime.of(day, LocalTime.of(15, 0));
                    createEvent("Company Meeting", startTime, endTime, people[0], Arrays.asList(people), EventColor.YELLOW);
                }

                // Create sprint planning events
                for (LocalDate day : sprintPlanningDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(13, 0));
                    LocalDateTime endTime = LocalDateTime.of(day, LocalTime.of(14, 0));
                    createEvent("Sprint Planning", startTime, endTime, people[0], Arrays.asList(people[1], people[2], people[3], people[4], people[5], people[6], people[7], people[8], people[9]), EventColor.RED);
                }

                // Create 1 on 1 events
                for (int i = 0; i < oneOnOneDays.size(); i++) {
                    LocalDate day = oneOnOneDays.get(i);
                    PISUser manager = people[(i % 4) + 1]; // Cycle through managers only
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(9, 0));
                    LocalDateTime endTime = LocalDateTime.of(day, LocalTime.of(10, 0));
                    createEvent("1 on 1 with " + manager.getName(), startTime, endTime, people[0], Arrays.asList(manager), EventColor.RED);
                }

                // Add code freeze events
                for (LocalDate day : codeFreezeDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(0, 0));
                    LocalDateTime endTime = LocalDateTime.of(day, LocalTime.of(23, 59));
                    createEvent("Code Freeze", startTime, endTime, people[0], Arrays.asList(people), EventColor.GREEN);
                }

                // Add two-day spa events for managers and director
                for (LocalDate day : spaDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(0, 0));
                    LocalDateTime endTime = LocalDateTime.of(day.plusDays(1), LocalTime.of(23, 59));
                    createEvent("Two-day Spa", startTime, endTime, people[0], Arrays.asList(people[0], people[1], people[2], people[3], people[4]), EventColor.BLUE);
                }

                // Home-office events
                for (LocalDate day : homeOfficeDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(12, 0));
                    LocalDateTime endTime = startTime.plusDays(2);
                    createEvent("Home-office", startTime, endTime, people[0], Arrays.asList(people[0]), EventColor.RED);
                }

                // Check-servers events
                for (LocalDate day : checkServersDays) {
                    LocalDateTime startTime = LocalDateTime.of(day, LocalTime.of(16, 0));
                    LocalDateTime endTime = startTime.plusMinutes(10);
                    createEvent("Check-servers", startTime, endTime, people[0], Arrays.asList(people[0]), EventColor.RED);
                }

            }

            utx.commit();
        }catch (Exception e) {
            e.printStackTrace();
            try {
                utx.rollback();
            } catch (Exception rollbackException) {
                rollbackException.printStackTrace();
            }
        }
    }

    private void createEvent(String eventName, LocalDateTime start, LocalDateTime end, PISUser creator, List<PISUser> attendees, EventColor color) {
        Event event = new Event();
        event.setName(eventName);
        event.setStart(java.sql.Timestamp.valueOf(start));
        event.setEnd(java.sql.Timestamp.valueOf(end));
        event.setCreator(creator);
        event.setAttendees(attendees);
        event.setColor(color);
        em.persist(event);
    
        // Add event to attendees
        for (PISUser attendee : attendees) {
            attendee.getEvents().add(event);
        }
    }
}
