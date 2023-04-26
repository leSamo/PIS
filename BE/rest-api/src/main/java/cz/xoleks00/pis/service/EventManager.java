package cz.xoleks00.pis.service;

import java.util.List;

import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import cz.xoleks00.pis.data.Event;

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
}
