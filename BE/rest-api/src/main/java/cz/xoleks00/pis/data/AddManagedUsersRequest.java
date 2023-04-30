package cz.xoleks00.pis.data;

import java.util.List;

public class AddManagedUsersRequest {

    private List<String> usernames;

    public List<String> getUsernames() {
        return usernames;
    }

    public void setUsernames(List<String> usernames) {
        this.usernames = usernames;
    }
}