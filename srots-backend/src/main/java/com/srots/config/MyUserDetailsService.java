package com.srots.config;

import com.srots.model.User;
import com.srots.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

	@Autowired
	private UserRepository repo;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		System.out.println("Looking for user in DB: " + username);

		User user = repo.findByEmailOrUsername(username, username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));

		System.out.println("User found! Hash in DB is: " + user.getPasswordHash());

		return new UserInfoUserDetails(user);
	}
}
