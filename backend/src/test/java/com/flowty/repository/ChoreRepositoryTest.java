package com.flowty.repository;

import com.flowty.model.ChoreItem;
import com.flowty.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ChoreRepositoryTest {

    @Autowired
    private ToDoListItemRepository toDoListItemRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    void findChoreItemsByUserOrderByRollNumberAsc() {
        User user = userRepository.save(User.builder()
                .username("test").email("t@t.com").password("pw").build());

        ChoreItem item1 = new ChoreItem();
        item1.setUser(user);
        item1.setTitle("Second");
        item1.setDescription("Second");
        item1.setRollNumber(2);
        item1.setCategory("CHORE");
        toDoListItemRepository.save(item1);

        ChoreItem item2 = new ChoreItem();
        item2.setUser(user);
        item2.setTitle("First");
        item2.setDescription("First");
        item2.setRollNumber(1);
        item2.setCategory("CHORE");
        toDoListItemRepository.save(item2);

        List<ChoreItem> chores = toDoListItemRepository.findChoreItemsByUserOrderByRollNumberAsc(user);

        assertThat(chores).hasSize(2);
        assertThat(chores.get(0).getRollNumber()).isEqualTo(1);
        assertThat(chores.get(1).getRollNumber()).isEqualTo(2);
    }
}