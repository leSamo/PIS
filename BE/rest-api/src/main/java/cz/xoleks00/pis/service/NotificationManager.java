package cz.xoleks00.pis.service;

import java.util.List;

import cz.xoleks00.pis.data.Notification;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;

public class NotificationManager {

    @PersistenceContext
    private EntityManager em;

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

    @Transactional
    public List<Notification> findByUsername(String username) {
        TypedQuery<Notification> query = em.createQuery(
                "SELECT n FROM Notification n WHERE n.attendee.username = :username", Notification.class);
        query.setParameter("username", username);
        return query.getResultList();
    }

    @Transactional
    public int ackAllByUsername(String username) {
        TypedQuery<Notification> query = em.createQuery(
                "UPDATE Notification n SET n.ack = true WHERE n.attendee.username = :username", Notification.class);
        query.setParameter("username", username);
        return query.executeUpdate();
    }
}
