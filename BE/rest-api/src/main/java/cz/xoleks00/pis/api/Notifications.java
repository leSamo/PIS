package cz.xoleks00.pis.api;

import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import cz.xoleks00.pis.data.Notification;
import cz.xoleks00.pis.data.NotificationDTO;
import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.data.UserDTO;
import cz.xoleks00.pis.service.NotificationManager;
import cz.xoleks00.pis.service.UserManager;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

/**
 * Notifications endpoints.
 */
@Tag(name = "Notifications", description = "Notification management operations")
@Path("/notifications")
public class Notifications {

    @Inject
    private NotificationManager ntfMgr;

    @Inject
    private UserManager userMgr;

    /**
     * Get notifications by username.
     * 
     * @param username
     * @return List of notifications.
     */
    @GET
    @Path("/{username}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get notifications by username")
    @APIResponse(responseCode = "200", description = "List of notifications", content = @Content(schema = @Schema(implementation = NotificationDTO.class)))
    @APIResponse(responseCode = "400", description = "User not found")
    public Response getNotificationsByUsername(
            @Parameter(description = "The username of the user") @PathParam("username") String username) {
        // ...
        PISUser user = userMgr.findByUsername(username);
        if (user == null) {
            return Response.status(Status.BAD_REQUEST)
                    .entity("User not found: " + username)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
        List<Notification> notifications = ntfMgr.findByUsername(username);
        List<NotificationDTO> notificationDTOs = notifications.stream()
                .map(notification -> {
                    PISUser creator = notification.getCreator();
                    UserDTO creatorDTO = new UserDTO(creator.getUsername(), creator.getName(), creator.getEmail(),
                            creator.getUserCreated(), creator.isAdmin(), creator.getUserRole(), creator.getId(),
                            creator.getManagedUsers());
                    return new NotificationDTO(notification.getId(), notification.getEvent().getName(),
                            notification.getEvent().getStart(), notification.getEvent().getEnd(),
                            notification.getEvent().getId(), creatorDTO, notification.isAck());
                })
                .collect(Collectors.toList());
        return Response.ok(notificationDTOs).build();
    }

    /**
     * Acknowledge all notifications by username.
     * 
     * @param username
     * @return The result message.
     */
    @PUT
    @Path("{username}/ack")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Acknowledge all notifications by username")
    @APIResponse(responseCode = "200", description = "The result message")
    @APIResponse(responseCode = "400", description = "User not found")
    public Response ackAllNotificationsByUsername(
            @Parameter(description = "The username of the user") @PathParam("username") String username) {
        if (userMgr.findByUsername(username) == null) {
            return Response.status(Status.BAD_REQUEST)
                    .entity("User not found: " + username)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
        int updatedNotifications = ntfMgr.ackAllByUsername(username);
        return Response.ok(username + " has " + updatedNotifications + " acknowledged notifications")
                .type(MediaType.APPLICATION_JSON).build();
    }
}
