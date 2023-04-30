package cz.xoleks00.pis.service;

import java.util.List;
import java.util.stream.Collectors;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.PISUser;
import jakarta.persistence.TypedQuery;

/**
 * Event manager EJB
 */
@RequestScoped
public class EventManager {
    @PersistenceContext
    private EntityManager em;

    public EventManager() {
    }
    
    /**
     * Save or update an event.
     * @param e The event to save or update.
     * @return The saved or updated event.
     */
    @Transactional
    public Event save(Event e) {
        PISUser creator = em.find(PISUser.class, e.getCreator().getId());
        if (creator != null) {
            creator.getEvents().add(e);
            e.setCreator(creator);
        } else {
            throw new IllegalArgumentException("Invalid creator ID");
        }
        return em.merge(e);
    }
    
    /**
     * Remove an event.
     * @param e The event to remove.
     */
    @Transactional
    public void remove(Event e) {
        em.remove(em.merge(e));
    }
    
    /**
     * Find an event by its id.
     * @param id The id of the event to find.
     * @return The event with the given id or null if not found.
     */
    public Event find(long id) {
        return em.find(Event.class, id);
    }
    
    /**
     * Find all events.
     * @return A list of all events.
     */
    public List<Event> findAll() {
        return em.createNamedQuery("Event.findAll", Event.class).getResultList();
    }

    public List<Event> findEventsByUserId(long userId) {
        TypedQuery<Event> query = em.createQuery("SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.attendees a WHERE e.creator.id = :userId OR a.id = :userId", Event.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }
    

    @Transactional
    public void removeById(long id) {
        Event event = em.find(Event.class, id);
        if (event != null) {
            em.remove(event);
        }
    }
    

    @Transactional
    public Event findById(long id) {
        return em.find(Event.class, id);
    }

    @Transactional
    public List<Event> findEventsByDateRange(Date startDate, Date endDate) {
        TypedQuery<Event> query = em.createQuery("SELECT e FROM Event e WHERE e.date >= :startDate AND e.date <= :endDate", Event.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        return query.getResultList();
    }

    @Transactional
    public List<Event> findEventsInRange(String startDateStr, String endDateStr, List<String> users) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX");
            Date startDate = sdf.parse(startDateStr);
            Date endDate = sdf.parse(endDateStr);
    
            List<Event> eventsInRange = em.createQuery("SELECT e FROM Event e WHERE (e.start BETWEEN :startDate AND :endDate) OR (e.eventEnd BETWEEN :startDate AND :endDate) OR (e.start <= :startDate AND e.eventEnd >= :endDate)", Event.class)
                     .setParameter("startDate", startDate)
                     .setParameter("endDate", endDate)
                     .getResultList();
    
            if (users == null || users.isEmpty()) {
                return eventsInRange;
            }
    
        return eventsInRange.stream()
                .filter(event -> users.contains(event.getCreator().getUsername()) || event.getAttendees().stream()
                        .anyMatch(attendee -> users.contains(attendee.getUsername())))
                .collect(Collectors.toList());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected format: yyyy-MM-dd'T'HH:mm:ssX");
        }
    }

    @Transactional
    public List<Event> findEventsByAttendee(PISUser user) {
        return em.createQuery("SELECT e FROM Event e JOIN e.attendees a WHERE a = :user", Event.class)
                 .setParameter("user", user)
                 .getResultList();
    }

    @Transactional
    public List<Event> findEventsByCreator(PISUser creator) {
        return em.createQuery("SELECT e FROM Event e WHERE e.creator = :creator", Event.class)
                 .setParameter("creator", creator)
                 .getResultList();
    }
    

    @Transactional
    public void update(Event event) {
        em.merge(event);
    }
    // http://localhost:9080/rest-api/rest/events?start_date=2023-04-28T00:00:00Z&end_date=2023-04-30T23:59:59Z&users=michall
    // http://localhost:9080/rest-api/rest/events?start_date=2023-04-28T00:00:00Z&end_date=2023-04-30T23:59:59Z&users=michall&users=user4
}
