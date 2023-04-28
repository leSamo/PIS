package cz.xoleks00.pis.jwtlogin;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

/**
 *
 * @author burgetr
 */
@Path("ping")
public class PingResource 
{

    @GET
    public String ping() {
        return "Ping OK";
    }
    
    @POST
    @Path("login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(Credentials credentials) {
        if (credentials != null
                && "test".equals(credentials.getLogin())
                && "secret".equals(credentials.getPassword())) {
            
            try
            {
                String token = JwtTokenGenerator.generateJWTString("/jwt-token.json", credentials.getLogin());
                TokenResponse resp = new TokenResponse(token);
                return Response.ok(resp).build();
            } catch (Exception e) {
                return Response.status(Status.INTERNAL_SERVER_ERROR).entity(e).build();
            }
            
        } else {
            return Response.status(Status.FORBIDDEN).entity("invalid login").build();
        }
    }
    
}
