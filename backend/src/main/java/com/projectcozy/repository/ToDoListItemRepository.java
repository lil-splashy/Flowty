package com.projectcozy.repository;

import com.projectcozy.model.ToDoListItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ToDoListItemRepository extends JpaRepository<ToDoListItem, Long> {
}
