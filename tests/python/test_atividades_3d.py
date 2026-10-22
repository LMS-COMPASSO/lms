#!/usr/bin/env python3
"""
=============================================================================
LMS COMPASSO - SUÍTE DE TESTES UNITÁRIOS DE ATIVIDADES PYTHON 3D (BNCC)
=============================================================================
Executa e valida as soluções de referência das 6 atividades do Laboratório 3D
contra os critérios pedagógicos de verificação definidos para a BNCC Computação.
Compatível tanto com pytest quanto com unittest da biblioteca padrão.
=============================================================================
"""

import unittest


class RoboGrade:
    """Simulador do Robô 3D em ambiente de grade com sensores e atuadores."""

    def __init__(self, grade, direcao_inicial="leste", max_passos=100):
        self.grade = [list(linha) for linha in grade]
        self.linhas = len(self.grade)
        self.colunas = len(self.grade[0])
        self.direcao = direcao_inicial
        self.passos = 0
        self.max_passos = max_passos
        self.itens_coletados = 0
        self.total_itens = sum(linha.count("I") for linha in self.grade)
        self.chegou_meta = False
        self.pos_r = None

        for r in range(self.linhas):
            for c in range(self.colunas):
                if self.grade[r][c] == "R":
                    self.pos_r = [r, c]
                    self.grade[r][c] = "."
                    break

        self.vetores = {
            "norte": (-1, 0),
            "leste": (0, 1),
            "sul": (1, 0),
            "oeste": (0, -1),
        }
        self.ordem_giro = ["norte", "leste", "sul", "oeste"]

    def _frente(self):
        dr, dc = self.vetores[self.direcao]
        return self.pos_r[0] + dr, self.pos_r[1] + dc

    def esta_livre(self):
        nr, nc = self._frente()
        if not (0 <= nr < self.linhas and 0 <= nc < self.colunas):
            return False
        celula = self.grade[nr][nc]
        return celula not in ("#", "P")

    def frente_porta(self):
        nr, nc = self._frente()
        if not (0 <= nr < self.linhas and 0 <= nc < self.colunas):
            return False
        return self.grade[nr][nc] == "P"

    def abrir_porta(self):
        nr, nc = self._frente()
        if 0 <= nr < self.linhas and 0 <= nc < self.colunas:
            if self.grade[nr][nc] == "P":
                self.grade[nr][nc] = "."

    def tem_item(self):
        r, c = self.pos_r
        return self.grade[r][c] == "I"

    def coletar(self):
        r, c = self.pos_r
        if self.grade[r][c] == "I":
            self.grade[r][c] = "."
            self.itens_coletados += 1

    def girar_direita(self):
        idx = (self.ordem_giro.index(self.direcao) + 1) % 4
        self.direcao = self.ordem_giro[idx]

    def girar_esquerda(self):
        idx = (self.ordem_giro.index(self.direcao) - 1) % 4
        self.direcao = self.ordem_giro[idx]

    def mover(self):
        self.passos += 1
        if self.passos > self.max_passos:
            raise RuntimeError("Limite máximo de passos excedido no labirinto 3D.")
        nr, nc = self._frente()
        if not (0 <= nr < self.linhas and 0 <= nc < self.colunas):
            raise RuntimeError(f"Colisão com limite do mapa na posição ({nr}, {nc}).")
        celula = self.grade[nr][nc]
        if celula == "#":
            raise RuntimeError(f"Colisão com obstáculo (#) na posição ({nr}, {nc}).")
        if celula == "P":
            raise RuntimeError("Colisão com porta de energia trancada (P).")
        self.pos_r = [nr, nc]
        if celula == "M":
            self.chegou_meta = True


class ListaTorres:
    """Simulador de ordenação de torres 3D."""

    def __init__(self, valores):
        self.valores = list(valores)
        self.comparacoes = 0
        self.trocas = 0

    def comparar(self, i, j):
        self.comparacoes += 1
        return self.valores[i] - self.valores[j]

    def trocar(self, i, j):
        self.trocas += 1
        self.valores[i], self.valores[j] = self.valores[j], self.valores[i]


class TorreHanoi:
    """Simulador tridimensional da Torre de Hanói."""

    def __init__(self, num_discos=3):
        self.pinos = {
            "A": list(reversed(range(1, num_discos + 1))),
            "B": [],
            "C": [],
        }
        self.movimentos = 0
        self.num_discos = num_discos

    def mover_disco(self, origem, destino):
        if not self.pinos[origem]:
            raise ValueError(f"Pino de origem {origem} está vazio!")
        disco = self.pinos[origem][-1]
        if self.pinos[destino] and self.pinos[destino][-1] < disco:
            raise ValueError(
                f"Regra violada: disco {disco} não pode ficar sobre {self.pinos[destino][-1]} no pino {destino}."
            )
        self.pinos[origem].pop()
        self.pinos[destino].append(disco)
        self.movimentos += 1


class TestAtividadesPython3D(unittest.TestCase):
    """Testes unitários para as 6 soluções de referência das atividades 3D."""

    def test_01_sequencia_labirinto(self):
        grade = ["R.I.", "##.#", "..M#"]
        robo = RoboGrade(grade, direcao_inicial="leste")
        codigo = """
robo.mover()
robo.mover()
robo.coletar()
robo.girar_direita()
robo.mover()
robo.mover()
"""
        exec(codigo, {"robo": robo})
        self.assertTrue(robo.chegou_meta, "Robô deve alcançar o portal (M).")
        self.assertEqual(
            robo.itens_coletados, 1, "Robô deve coletar o cristal (I)."
        )

    def test_02_condicionais_portas(self):
        grade = ["R.P.I", "####.", "....M"]
        robo = RoboGrade(grade, direcao_inicial="leste")
        codigo = """
for passo in range(4):
    if robo.frente_porta():
        robo.abrir_porta()
    robo.mover()
    if robo.tem_item():
        robo.coletar()

robo.girar_direita()
robo.mover()
robo.mover()
"""
        exec(codigo, {"robo": robo, "range": range})
        self.assertTrue(robo.chegou_meta, "Robô deve alcançar o portal (M).")
        self.assertEqual(
            robo.itens_coletados, 1, "Robô deve coletar o cristal (I)."
        )

    def test_03_lacos_repeticao(self):
        grade = ["R.I.I", "####.", "####I", "####M"]
        robo = RoboGrade(grade, direcao_inicial="leste")
        codigo = """
for i in range(4):
    robo.mover()
    if robo.tem_item():
        robo.coletar()

robo.girar_direita()
for i in range(3):
    robo.mover()
    if robo.tem_item():
        robo.coletar()
"""
        exec(codigo, {"robo": robo, "range": range})
        self.assertTrue(robo.chegou_meta, "Robô deve alcançar o portal (M).")
        self.assertEqual(
            robo.itens_coletados, 3, "Robô deve coletar todos os 3 cristais."
        )

    def test_04_funcoes_decomposicao(self):
        grade = ["R.I##", "##.I#", "###.M"]
        robo = RoboGrade(grade, direcao_inicial="leste")
        codigo = """
def avancar_e_coletar(passos):
    for i in range(passos):
        robo.mover()
        if robo.tem_item():
            robo.coletar()

avancar_e_coletar(2)
robo.girar_direita()
avancar_e_coletar(1)
robo.girar_esquerda()
avancar_e_coletar(1)
robo.girar_direita()
avancar_e_coletar(1)
robo.girar_esquerda()
avancar_e_coletar(1)
"""
        exec(codigo, {"robo": robo, "range": range})
        self.assertTrue(robo.chegou_meta, "Robô deve alcançar o portal (M).")
        self.assertEqual(
            robo.itens_coletados, 2, "Robô deve coletar todos os cristais."
        )

    def test_05_listas_ordenacao_bubble_sort(self):
        lista = ListaTorres([4, 2, 5, 1, 3])
        codigo = """
n = 5
for i in range(n - 1):
    for j in range(n - 1 - i):
        if lista.comparar(j, j + 1) > 0:
            lista.trocar(j, j + 1)
"""
        exec(codigo, {"lista": lista, "range": range})
        self.assertEqual(
            lista.valores,
            [1, 2, 3, 4, 5],
            "A lista de torres 3D deve ficar em ordem crescente.",
        )
        self.assertTrue(
            lista.trocas > 0, "Devem ocorrer trocas de blocos na cena 3D."
        )

    def test_06_recursao_torre_hanoi(self):
        hanoi = TorreHanoi(num_discos=3)
        codigo = """
def resolver_hanoi(n, origem, destino, auxiliar):
    if n == 1:
        hanoi.mover_disco(origem, destino)
    else:
        resolver_hanoi(n - 1, origem, auxiliar, destino)
        hanoi.mover_disco(origem, destino)
        resolver_hanoi(n - 1, auxiliar, destino, origem)

resolver_hanoi(3, 'A', 'C', 'B')
"""
        exec(codigo, {"hanoi": hanoi})
        self.assertEqual(
            hanoi.pinos["C"],
            [3, 2, 1],
            "Todos os 3 discos devem ser transferidos para o pino C.",
        )
        self.assertEqual(
            hanoi.movimentos,
            7,
            "A solução mínima para 3 discos é exatamente 7 movimentos.",
        )


if __name__ == "__main__":
    unittest.main()

