package cz.xoleks00.pis.service;

import java.util.List;

import cz.xoleks00.pis.data.Notification;
import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;

/**
 * Notification manager class.
 */
@RequestScoped
public class NotificationManager {

    @PersistenceContext
    private EntityManager em;

    /**
     * Save notification.
     * 
     * @param notification
     * @return Notification.
     */
    @Transactional
    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            // Persist a new notification
            em.persist(notification);
            return notification;
        } else {
            // Merge an existing notification
            return em.merge(notification);
        }
    }

    /**
     * Find notification by username.
     * 
     * @param username
     * @return List of notifications.
     */
    @Transactional
    public List<Notification> findByUsername(String username) {
        TypedQuery<Notification> query = em.createQuery(
                "SELECT n FROM Notification n WHERE n.attendee.username = :username", Notification.class);
        query.setParameter("username", username);
        return query.getResultList();
    }

    /**
     * Ack notifications by username.
     * 
     * @param username
     * @return List of notifications.
     */
    @Transactional
    public int ackAllByUsername(String username) {
        TypedQuery<Notification> query = em.createQuery(
                "UPDATE Notification n SET n.ack = true WHERE n.attendee.username = :username", Notification.class);
        query.setParameter("username", username);
        return query.executeUpdate();
    }

    /**
     * Remove notification.
     * 
     * @param notification
     */
    @Transactional
    public void remove(Notification notification) {
        Notification managedNotification = em.find(Notification.class, notification.getId());
        if (managedNotification != null) {
            em.remove(managedNotification);
        }
    }

    /**
     * Find notification by event id.
     * 
     * @param eventId
     * @return List of notifications.
     */
    @Transactional
    public List<Notification> findByEventId(long eventId) {
        TypedQuery<Notification> query = em.createQuery(
                "SELECT n FROM Notification n WHERE n.event.id = :eventId", Notification.class);
        query.setParameter("eventId", eventId);
        return query.getResultList();
    }

}
