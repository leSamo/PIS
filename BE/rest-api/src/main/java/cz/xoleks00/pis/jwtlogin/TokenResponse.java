/**
 * 
 */
package cz.xoleks00.pis.jwtlogin;

/**
 * A token resonse to be returned via JAX-RS.
 * 
 * @author burgetr
 */
public class TokenResponse
{
    private String token;

    public TokenResponse(String token)
    {
        this.token = token;
    }

    public String getToken()
    {
        return token;
    }

    public void setToken(String token)
    {
        this.token = token;
    }
}
