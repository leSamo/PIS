package cz.xoleks00.pis.jwtlogin;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.mindrot.jbcrypt.BCrypt;

import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.service.UserManager;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Tag(name = "Login", description = "Login and JWT management")
@Path("login")
public class LoginResource {

    @Inject
    private UserManager userManager;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(Credentials credentials) {
        if (credentials != null) {
            PISUser PISUser = userManager.findByUsername(credentials.getLogin());
            if (PISUser != null && BCrypt.checkpw(credentials.getPassword(), PISUser.getPassword())) {
                try {
                    String token = JwtTokenGenerator.generateJWTString("/jwt-token.json", PISUser);
                    TokenResponse resp = new TokenResponse(token);
                    return Response.ok(resp).build();
                } catch (Exception e) {
                    return Response.status(Status.INTERNAL_SERVER_ERROR).entity(e).type(MediaType.APPLICATION_JSON).build();
                }
            } else {
                return Response.status(Status.UNAUTHORIZED).entity("Invalid login credentials").type(MediaType.APPLICATION_JSON).build();
            }
        } else {
            return Response.status(Status.UNAUTHORIZED).entity("Invalid login credentials").type(MediaType.APPLICATION_JSON).build();
        }
    }
}
