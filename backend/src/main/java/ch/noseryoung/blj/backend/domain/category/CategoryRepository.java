package ch.noseryoung.blj.backend.domain.category;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByName(String name);
}

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    ScopedValue<Object> findById(Long id);
}