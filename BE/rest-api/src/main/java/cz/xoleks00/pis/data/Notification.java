package cz.xoleks00.pis.data;

import jakarta.persistence.*;

@Entity
@Table(name = "Notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "attendee_id", nullable = false)
    private PISUser attendee;

    @OneToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private PISUser creator;

    @Column(name = "ack", nullable = false)
    private boolean ack;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public PISUser getAttendee() {
        return attendee;
    }

    public void setAttendee(PISUser attendee) {
        this.attendee = attendee;
    }

    public PISUser getCreator() {
        return creator;
    }

    public void setCreator(PISUser creator) {
        this.creator = creator;
    }

    public boolean isAck() {
        return ack;
    }

    public void setAck(boolean ack) {
        this.ack = ack;
    }
}