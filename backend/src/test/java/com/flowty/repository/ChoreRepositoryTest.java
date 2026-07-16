package com.flowty.repository;

import com.flowty.model.Chore;
import com.flowty.model.User;
import com.flowty.model.enums.ChoreCategory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ChoreRepositoryTest {

    @Autowired
    private ChoreRepository choreRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUserOrderByRollNumberAsc() {
        User user = userRepository.save(User.builder()
                .username("test").email("t@t.com").password("pw").build());

        choreRepository.save(Chore.builder().user(user).rollNumber(2).description("Second").category(ChoreCategory.CHORE).build());
        choreRepository.save(Chore.builder().user(user).rollNumber(1).description("First").category(ChoreCategory.CHORE).build());

        List<Chore> chores = choreRepository.findByUserOrderByRollNumberAsc(user);

        assertThat(chores).hasSize(2);
        assertThat(chores.get(0).getRollNumber()).isEqualTo(1);
        assertThat(chores.get(1).getRollNumber()).isEqualTo(2);
    }
}