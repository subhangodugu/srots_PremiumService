package com.srots.config;

import com.srots.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class UserInfoUserDetails implements UserDetails {
    private final String userId;
    private final String username;
    private final String password;
    private final String collegeId; // ADDED: Required for @PreAuthorize checks
    private final boolean isRestricted;
    private final boolean isCollegeHead;
    private final String accountStatus; // ADDED
    private final Collection<? extends GrantedAuthority> authorities;

    public UserInfoUserDetails(User user) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.collegeId = (user.getCollege() != null) ? user.getCollege().getId() : null;
        this.isRestricted = user.getIsRestricted() != null && user.getIsRestricted();
        this.isCollegeHead = user.getIsCollegeHead() != null && user.getIsCollegeHead();
        this.accountStatus = null; // Default, will be handled in AuthController for now or we could fetch here

        String roleWithPrefix = "ROLE_" + (user.getRole() != null ? user.getRole().name() : "GUEST");
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(roleWithPrefix));

        // DEBUG LOGS - Check your console when you log in!
        System.out
                .println("Login Debug: User=" + username + " | Role=" + roleWithPrefix + " | isHead=" + isCollegeHead);
    }

    public boolean isRestricted() {
        return isRestricted;
    }

    // This allows @PreAuthorize("principal.isCollegeHead") to work
    public boolean isCollegeHead() {
        return isCollegeHead;
    }

    // This allows @PreAuthorize("principal.userId == #id") to work
    public String getUserId() {
        return userId;
    }

    // This allows @PreAuthorize("principal.collegeId == #collegeId") to work
    public String getCollegeId() {
        return collegeId;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // We handle locking/HOLD logic manually in AuthController to provide custom
                     // responses
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}