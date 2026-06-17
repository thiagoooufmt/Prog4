
CREATE TABLE tb_alunos (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    rga VARCHAR(20) NOT NULL UNIQUE,
    data_matricula DATE NOT NULL
);


INSERT INTO tb_alunos (nome, rga, data_matricula)
VALUES 
    ('Thiagoo', '202610115', '2026-06-17'),
    ('Thiagoo2', '202610116', '2026-06-17');

SELECT * FROM tb_alunos;
