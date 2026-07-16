package com.flowty.repository;

import com.flowty.model.Chore;
import com.flowty.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChoreRepository extends JpaRepository<Chore, UUID> {
    List<Chore> findByUserOrderByRollNumberAsc(User user);
}