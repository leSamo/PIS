/**
 * 
 */
package cz.xoleks00.pis.service;

import java.util.List;

import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import cz.xoleks00.pis.data.Event;


/**
 * Person manager EJB
 * @author burgetr
 */
@RequestScoped
public class EventManager 
{
    @PersistenceContext
    private EntityManager em;

    public EventManager() 
    {
    }
    
    @Transactional
    public Event save(Event p)
    {
    	return em.merge(p);
    }
	
    @Transactional
    public void remove(Event p)
    {
    	em.remove(em.merge(p));
    }
    

    public Event find(long id)
    {
    	return em.find(Event.class, id);
    }
    
    public List<Event> findAll()
    {
    	return em.createNamedQuery("Event.findAll", Event.class).getResultList();
    }

}
