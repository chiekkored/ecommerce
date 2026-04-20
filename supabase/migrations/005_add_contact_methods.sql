-- Migration 005: Add contact methods to order_requests
alter table order_requests 
add column if not exists buyer_messenger text,
add column if not exists buyer_instagram text;
