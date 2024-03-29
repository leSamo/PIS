package cz.xoleks00.pis.data;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

/**
 * Event class.
 */
@Entity
@Table(name = "Event")
@NamedQueries({
        @NamedQuery(name = "Event.findAll", query = "SELECT e FROM Event e"),
        @NamedQuery(name = "Event.findByName", query = "SELECT e FROM Event e WHERE e.name = :name")
})
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Temporal(TemporalType.TIMESTAMP)
    private Date start;
    @Temporal(TemporalType.TIMESTAMP)
    private Date eventEnd;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id", referencedColumnName = "id")
    private PISUser creator;
    private String name;
    private String place;
    @Enumerated(EnumType.STRING)
    private EventColor color;
    private String description;
    private List<PISUser> attendees;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return eventEnd;
    }

    public void setEnd(Date eventEnd) {
        this.eventEnd = eventEnd;
    }

    public PISUser getCreator() {
        return creator;
    }

    public void setCreator(PISUser creator) {
        this.creator = creator;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<PISUser> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<PISUser> attendees) {
        this.attendees = attendees;
    }

    public EventColor getColor() {
        return color;
    }

    public void setColor(EventColor color) {
        this.color = color;
    }
}
