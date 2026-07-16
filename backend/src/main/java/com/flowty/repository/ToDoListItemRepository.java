package com.flowty.repository;

import com.flowty.model.ChoreItem;
import com.flowty.model.ToDoListItem;
import com.flowty.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ToDoListItemRepository extends JpaRepository<ToDoListItem, Long> {

    @Query("SELECT c FROM ChoreItem c WHERE c.user = :user ORDER BY c.rollNumber ASC")
    List<ChoreItem> findChoreItemsByUserOrderByRollNumberAsc(@Param("user") User user);
}