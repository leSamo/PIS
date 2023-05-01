package cz.xoleks00.pis.data;

import java.util.Date;

/**
 * Notification DTO.
 */
public class NotificationDTO {
    private Long id;
    private String eventName;
    private Date eventStart;
    private Date eventEnd;
    private Long eventId;
    private UserDTO creator;
    private boolean ack;

    public NotificationDTO(Long id, String eventName, Date eventStart, Date eventEnd, Long eventId, UserDTO creator,
            boolean ack) {
        this.id = id;
        this.eventName = eventName;
        this.eventStart = eventStart;
        this.eventEnd = eventEnd;
        this.eventId = eventId;
        this.creator = creator;
        this.ack = ack;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Date getEventStart() {
        return eventStart;
    }

    public void setEventStart(Date eventStart) {
        this.eventStart = eventStart;
    }

    public Date getEventEnd() {
        return eventEnd;
    }

    public void setEventEnd(Date eventEnd) {
        this.eventEnd = eventEnd;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public UserDTO getCreator() {
        return creator;
    }

    public void setCreator(UserDTO creator) {
        this.creator = creator;
    }

    public boolean isAck() {
        return ack;
    }

    public void setAck(boolean ack) {
        this.ack = ack;
    }
}
