package com.flowty.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flowty.model.ToDoListItem;

public interface ToDoListItemRepository extends JpaRepository<ToDoListItem, Long> {
}
