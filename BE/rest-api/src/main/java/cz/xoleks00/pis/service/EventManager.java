package cz.xoleks00.pis.service;

import java.util.List;
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

    public List<Event> findEventsByDateRange(Date startDate, Date endDate) {
        TypedQuery<Event> query = em.createQuery("SELECT e FROM Event e WHERE e.date >= :startDate AND e.date <= :endDate", Event.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        return query.getResultList();
    }

}
