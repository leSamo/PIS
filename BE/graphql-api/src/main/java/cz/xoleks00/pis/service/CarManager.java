package cz.xoleks00.pis.service;
import java.util.List;

import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import cz.xoleks00.pis.data.Car;



/**
 * @author burgetr
 *
 */
@RequestScoped
public class CarManager 
{
    @PersistenceContext
    private EntityManager em;

    public Car find(String id)
    {
    	return em.find(Car.class, id);
    }
    
    public List<Car> findBegining(String id)
    {
        String pref = id + "%";
		List<Car> ret = em.createQuery("SELECT c FROM Car c WHERE c.reg LIKE :pref", Car.class).setParameter("pref", pref).getResultList();
    	return ret;
    }
    
    public Car save(Car p)
    {
    	return em.merge(p);
    }
	
    public void remove(Car p)
    {
    	em.remove(em.merge(p));
    }
    
	public List<Car> findAll()
    {
    	return em.createQuery("SELECT c FROM Car c", Car.class).getResultList();
    }

}
