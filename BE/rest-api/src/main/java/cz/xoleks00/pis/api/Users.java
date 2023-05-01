package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import cz.xoleks00.pis.data.AddManagedUsersRequest;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.Notification;
import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.data.UserDTO;
import cz.xoleks00.pis.service.EventManager;
import cz.xoleks00.pis.service.NotificationManager;
import cz.xoleks00.pis.service.UserManager;


/*
 * TEST URL:
 * http://localhost:8080/jsf-basic/rest/users/list
 */
@Tag(name = "Users", description = "User management operations")
@Path("/users")
public class Users
{
	@Inject
	private UserManager userMgr; 

    @Inject
    private EventManager eventMgr;

    @Inject
    private NotificationManager ntfMgr;


    @Context
    private UriInfo context;

    @Context
    private SecurityContext securityContext;


    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{4,20}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^[a-zA-Z0-9!@#$%^&*()_+,-./:;<=>?@[\\\\]^_`{|}~]{8,128}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    /**
     * Default constructor. 
     */
    public Users() 
    {
    }

    @PostConstruct
    public void init()
    {
    }
    

    @Operation(summary = "Get all users or filter by a substring")
    @APIResponse(responseCode = "200", description = "A list of users", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UserDTO.class, type = SchemaType.ARRAY)))
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @GET
    @RolesAllowed({ "admin", "employee" })
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserDTO> getUsers(@Parameter(description = "Username substring") @QueryParam("filter") String filter) {
        List<PISUser> users;
        if (filter != null && !filter.isEmpty()) {
            users = userMgr.findBySubstring(filter);
        } else {
            users = userMgr.findAll();
        }
    
        List<UserDTO> userDTOs = users.stream()
            .map(user -> new UserDTO(user.getUsername(), user.getName(), user.getEmail(), user.getUserCreated(), user.isAdmin(), user.getUserRole(), user.getId(), user.getManagedUsers()))
            .collect(Collectors.toList());
    
        return userDTOs;
    }

    
    @Operation(summary = "Get a single user by their username")
    @APIResponse(responseCode = "200", description = "The user information",
        content = @Content(mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = PISUser.class)))
    @APIResponse(responseCode = "404", description = "User not found")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @Path("/{username}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getUserSingle(@Parameter(description = "Username of the user") @PathParam("username") String username) {
        // ...
        PISUser p = userMgr.findByUsername(username);
        if (p != null) {
            return Response.ok(p).build();
        } else {
            return Response.status(Status.NOT_FOUND).entity("User not found for username: " + username).type(MediaType.APPLICATION_JSON).build();
        }
    }

    /**
     * Updates a PISUser.
     * @param id
     * @param src
     * @return
     */
    @Operation(summary = "Updates a PISUser")
    @APIResponse(responseCode = "200", description = "The updated user information",
        content = @Content(mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = PISUser.class)))
    @APIResponse(responseCode = "404", description = "User not found")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @Path("/{id}")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updateUserSingle(@Parameter(description = "ID of the user to update") @PathParam("id") Long id, PISUser src) 
    {
    	PISUser p = userMgr.find(id);
    	if (p != null)
    	{
    		p.setName(src.getName());
    		p.setUserCreated(src.getUserCreated());
    		return Response.ok(p).build();
    	}
    	else
    		return Response.status(Status.NOT_FOUND).entity("not found").type(MediaType.APPLICATION_JSON).build();
    }
    

    /**
     * Update a PISUser.
     * @param username The username of the PISUser to update.
     * @param src The PISUser object containing the updated fields.
     * @return A response indicating success or failure.
     */
    @Operation(summary = "Update a PISUser")
    @APIResponse(responseCode = "200", description = "The updated user information",
        content = @Content(mediaType = MediaType.APPLICATION_JSON,
            schema = @Schema(implementation = PISUser.class)))
    @APIResponse(responseCode = "400", description = "No valid updates provided")
    @APIResponse(responseCode = "404", description = "User not found")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @Path("/{username}")
    @PATCH
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin" })
    public Response patchUser(@Parameter(description = "Username of the user to update") @PathParam("username") String username, PISUser src) {
        PISUser p = userMgr.findByUsername(username);
        if (p != null) {
            boolean isUpdated = false;
            
            if (src.getName() != null && !src.getName().isEmpty()) {
                p.setName(src.getName());
                isUpdated = true;
            }

            if (src.getPassword() != null && !src.getPassword().isEmpty() && PASSWORD_PATTERN.matcher(src.getPassword()).matches()) {
                p.setPassword(src.getPassword());
                isUpdated = true;
            }

            if (src.getEmail() != null && !src.getEmail().isEmpty() && EMAIL_PATTERN.matcher(src.getEmail()).matches()) {
                p.setEmail(src.getEmail());
                isUpdated = true;
            }

            if (src.getUserRole() != null) {
                p.setUserRole(src.getUserRole());
                isUpdated = true;
            }

            if (isUpdated) {
                p.setAdmin(src.isAdmin());
                userMgr.save(p);
                return Response.ok(p).build();
            } else {
                return Response.status(Status.BAD_REQUEST).entity("No valid updates provided").type(MediaType.APPLICATION_JSON).build();
            }
        } else {
            return Response.status(Status.NOT_FOUND).entity("User not found for username: " + username).type(MediaType.APPLICATION_JSON).build();
        }
    }

    /**
     * Adds a new PISUser.
     * @param PISUser The PISUser to add.
     * @return
     */
    @Operation(summary = "Add a new PISUser")
    @APIResponse(responseCode = "201", description = "User added successfully")
    @APIResponse(responseCode = "400", description = "Invalid username, password, or email")
    @APIResponse(responseCode = "409", description = "User already exists")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public Response addUser(PISUser PISUser) {
        if (!USERNAME_PATTERN.matcher(PISUser.getUsername()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity("Invalid username").type(MediaType.APPLICATION_JSON).build();
        }
    
        if (!PASSWORD_PATTERN.matcher(PISUser.getPassword()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity("Invalid password").type(MediaType.APPLICATION_JSON).build();
        }
    
        if (!EMAIL_PATTERN.matcher(PISUser.getEmail()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity("Invalid email").type(MediaType.APPLICATION_JSON).build();
        }
    
        PISUser existingByUsername = userMgr.findByUsername(PISUser.getUsername());
        if (existingByUsername != null) {
            return Response.status(Status.BAD_REQUEST).entity("Username is taken").type(MediaType.APPLICATION_JSON).build();
        }
    
        PISUser existingByEmail = userMgr.findByEmail(PISUser.getEmail());
        if (existingByEmail != null) {
            return Response.status(Status.BAD_REQUEST).entity("Email is taken").type(MediaType.APPLICATION_JSON).build();
        }
    
        PISUser.setUserCreated(new Date()); // Set the current date as userCreated
        PISUser.setAdmin(PISUser.isAdmin()); 
        PISUser savedUser = userMgr.save(PISUser);
        final URI uri = UriBuilder.fromPath("/users/{resourceServerId}").build(savedUser.getId());
        return Response.created(uri).build(); 
    }
    
    
    /**
     * Deletes a PISUser.
     * @param username
     * @return
     */
    @Operation(summary = "Delete a PISUser by their username")
    @APIResponse(responseCode = "204", description = "User deleted successfully")
    @APIResponse(responseCode = "404", description = "User not found")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @Path("/{username}")
    @DELETE
    @RolesAllowed({ "admin" })
    public Response deleteUser(@Parameter(description = "Username of the user to delete") @PathParam("username") String username) {

        PISUser p = userMgr.findByUsername(username);
    
        // Get the logged-in user's ID
        JsonWebToken token = (JsonWebToken) securityContext.getUserPrincipal();
        String loggedInUsername = token.getClaim("sub");
        PISUser o = userMgr.findByUsername(loggedInUsername);
    
        if (username.equals(o.getUsername())) {
            return Response.status(Status.BAD_REQUEST).entity("User cannot delete themselves").type(MediaType.APPLICATION_JSON).build();
        }
    
        if (p != null) {
            // Remove all notifications for the user
            List<Notification> userNotifications = ntfMgr.findByUsername(p.getUsername());
            for (Notification notification : userNotifications) {
                ntfMgr.remove(notification);
            }
    
            // Remove the user from all associated events
            List<Event> events = eventMgr.findEventsByAttendee(p);
            for (Event event : events) {
                event.getAttendees().removeIf(attendee -> attendee.getUsername().equals(username));
                eventMgr.update(event);
            }
    
            // Remove the events where the user is the creator
            List<Event> userEvents = eventMgr.findEventsByCreator(p);
            for (Event event : userEvents) {
                eventMgr.remove(event);
            }
    
            userMgr.remove(p);
            return Response.ok().build();
        } else {
            return Response.status(Status.NOT_FOUND).entity("not found").type(MediaType.APPLICATION_JSON).build();
        }
    }
    


    /**
     * Get all users managed by a given user.
     * @param username Username of the user whose managed users to retrieve.
     * @return A list of users managed by the given user.
     */
    @Operation(summary = "Get all users managed by a given user")
    @APIResponse(responseCode = "200", description = "A list of managed users", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UserDTO.class, type = SchemaType.ARRAY)))
    @APIResponse(responseCode = "404", description = "User not found")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @GET
    @Path("/{username}/managed_users")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"admin", "employee"})
    public Response getManagedUsers(@Parameter(description = "Username of the user whose managed users to retrieve") @PathParam("username") String username) {
        PISUser user = userMgr.findByUsername(username);
        if (user == null) {
            return Response.status(Status.NOT_FOUND).entity("User not found").type(MediaType.APPLICATION_JSON).build();
        }
        Set<String> managedUsernames = user.getManagedUsers();
        List<UserDTO> managedUsers = managedUsernames.stream()
                .map(managedUsername -> {
                    PISUser managedUser = userMgr.findByUsername(managedUsername);
                    if (managedUser != null) {
                        return new UserDTO(managedUser.getUsername(), managedUser.getName(), managedUser.getEmail(),
                                managedUser.getUserCreated(), managedUser.isAdmin(), managedUser.getUserRole(), managedUser.getId(), managedUser.getManagedUsers());
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return Response.ok().entity(managedUsers).build();
    }
    


    /**
     * Add multiple managed users to a user.
     *
     * @param username         Username of the user to add managed users to.
     * @param managedUsernames Array of usernames of the users to be managed.
     * @return A response indicating success or failure.
     */
    @Operation(summary = "Add multiple managed users to a user")
    @APIResponse(responseCode = "200", description = "Managed users added successfully")
    @APIResponse(responseCode = "400", description = "Managed user not found")
    @APIResponse(responseCode = "404", description = "User not found")
    @APIResponse(responseCode = "401", description = "Unauthorized")
    @POST
    @Path("/{username}/managed_users")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"admin"})
    public Response addManagedUsers(@Parameter(description = "Username of the user to add managed users to") @PathParam("username") String username, AddManagedUsersRequest requestBody) {
        PISUser user = userMgr.findByUsername(username);
        if (user == null) {
            return Response.status(Status.NOT_FOUND).entity("User not found").type(MediaType.APPLICATION_JSON).build();
        }

        user.getManagedUsers().clear();

        List<String> managedUsernames = requestBody.getUsernames();
        for (String managedUsername : managedUsernames) {
            PISUser managedUser = userMgr.findByUsername(managedUsername);
            if (managedUser == null) {
                return Response.status(Status.BAD_REQUEST).entity("Managed user not found: " + managedUsername).type(MediaType.APPLICATION_JSON).build();
            }
        }

        user.getManagedUsers().addAll(managedUsernames);
        userMgr.save(user);

        return Response.ok().build();
    }

    //{
    //"usernames": ["user1", "user2", "user3"]
    //}

}