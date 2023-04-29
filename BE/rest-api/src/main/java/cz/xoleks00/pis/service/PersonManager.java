/**
 * 
 */
package cz.xoleks00.pis.service;

import java.util.List;

import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import cz.xoleks00.pis.data.Car;
import cz.xoleks00.pis.data.Person;


/**
 * Person manager EJB
 * @author burgetr
 */
@RequestScoped
public class PersonManager 
{
    @PersistenceContext
    private EntityManager em;

    public PersonManager() 
    {
    }
    
    @Transactional
    public Person save(Person p)
    {
    	return em.merge(p);
    }
	
    @Transactional
    public void remove(Person p)
    {
    	em.remove(em.merge(p));
    }
    
    @Transactional
    public void addCar(Person p, Car c)
    {
    	p.getCars().add(c);
    	c.setOwner(p);
    	save(p);
    }
    
    public Person findByUsername(String username) {
        try {
            TypedQuery<Person> query = em.createQuery("SELECT p FROM Person p WHERE p.username = :username", Person.class);
            query.setParameter("username", username);
            return query.getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
    
    public Person find(long id)
    {
    	return em.find(Person.class, id);
    }

    public Person findById(long id) {
    return em.find(Person.class, id);
    }
    
    public List<Person> findAll()
    {
    	return em.createNamedQuery("Person.findAll", Person.class).getResultList();
    }

}
