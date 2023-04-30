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
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
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

    public List<PISUser> findBySubstring(String filter) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<PISUser> cq = cb.createQuery(PISUser.class);
        Root<PISUser> user = cq.from(PISUser.class);
    
        Predicate usernamePredicate = cb.like(user.get("username"), "%" + filter + "%");
        Predicate namePredicate = cb.like(user.get("name"), "%" + filter + "%");
        Predicate emailPredicate = cb.like(user.get("email"), "%" + filter + "%");
    
        cq.where(cb.or(usernamePredicate, namePredicate, emailPredicate));
    
        TypedQuery<PISUser> query = em.createQuery(cq);
        return query.getResultList();
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
