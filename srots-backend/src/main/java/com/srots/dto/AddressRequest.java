package com.srots.dto;

import lombok.Data;

@Data
public class AddressRequest {
	private String addressLine1;
	private String village;
	private String city;
	private String state;
	private String zip;
	private String country;
}
