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
import cz.xoleks00.pis.data.PISUser;


/**
 * PISUser manager EJB
 * @author burgetr
 */
@RequestScoped
public class UserManager 
{
    @PersistenceContext
    private EntityManager em;

    public UserManager() 
    {
    }
    
    @Transactional
    public PISUser save(PISUser p)
    {
    	return em.merge(p);
    }
	
    @Transactional
    public void remove(PISUser p)
    {
    	em.remove(em.merge(p));
    }
    
    @Transactional
    public void addCar(PISUser p, Car c)
    {
    	p.getCars().add(c);
    	c.setOwner(p);
    	save(p);
    }
    
    public PISUser findByUsername(String username) {
        try {
            TypedQuery<PISUser> query = em.createQuery("SELECT p FROM PISUser p WHERE p.username = :username", PISUser.class);
            query.setParameter("username", username);
            return query.getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public PISUser findByEmail(String email) {
        try {
            TypedQuery<PISUser> query = em.createQuery("SELECT p FROM PISUser p WHERE p.email = :email", PISUser.class);
            query.setParameter("email", email);
            return query.getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
    
    public PISUser find(long id)
    {
    	return em.find(PISUser.class, id);
    }

    public PISUser findById(long id) {
    return em.find(PISUser.class, id);
    }
    
    public List<PISUser> findAll()
    {
    	return em.createNamedQuery("PISUser.findAll", PISUser.class).getResultList();
    }

}
