import flet as ft
import random

# ========= FUNCIONES ECC =========
def inverso(n, p):
    return pow(n, -1, p)

def sumar_puntos(P, Q, a, p):
    if P is None:
        return Q
    if Q is None:
        return P

    x1, y1 = P
    x2, y2 = Q

    if x1 == x2 and y1 == y2:
        return doblar_punto(P, a, p)

    if x1 == x2:
        return None

    lam = ((y2 - y1) * inverso((x2 - x1) % p, p)) % p
    x3 = (lam**2 - x1 - x2) % p
    y3 = (lam*(x1 - x3) - y1) % p

    return (x3, y3)

def doblar_punto(P, a, p):
    if P is None:
        return None

    x1, y1 = P
    if y1 == 0:
        return None

    lam = ((3*x1**2 + a) * inverso(2*y1, p)) % p
    x3 = (lam**2 - 2*x1) % p
    y3 = (lam*(x1 - x3) - y1) % p

    return (x3, y3)

def multiplicacion_escalar(P, n, a, p):
    R = None
    Q = P

    while n > 0:
        if n % 2 == 1:
            R = sumar_puntos(R, Q, a, p)
        Q = doblar_punto(Q, a, p)
        n //= 2

    return R

# ========= APP =========
def main(page: ft.Page):
    page.title = "ECDH Visual"
    page.bgcolor = "#f5f6fa"

    # Parámetros de curva (inputs)
    _tf_style = dict(width=80, text_size=14, dense=True, color="#222222",
                       label_style=ft.TextStyle(color="#555555"),
                       border_color="#3f51b5", focused_border_color="#1a237e",
                       bgcolor="#ffffff")
    input_a = ft.TextField(label="a", value="2", **_tf_style)
    input_b = ft.TextField(label="b", value="3", **_tf_style)
    input_p = ft.TextField(label="p", value="97", **_tf_style)
    input_gx = ft.TextField(label="Gx", value="3", **_tf_style)
    input_gy = ft.TextField(label="Gy", value="6", **_tf_style)
    curva_label = ft.Text("", size=13, color="#666666")

    # ========= PERSONA (icono) =========
    def persona_icon(color_circulo, color_cuerpo):
        return ft.Column([
            ft.Container(width=40, height=40, bgcolor=color_circulo, border_radius=20),
            ft.Container(
                width=70, height=35, bgcolor=color_cuerpo,
                border_radius=ft.BorderRadius(35, 35, 0, 0),
            ),
        ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=2)

    # UI ELEMENTS
    resultado = ft.Text("", size=18, weight="bold", color="#333333")

    # --- Textos de Alicia ---
    alice_nombre = ft.Text("Alicia", size=18, color="#e91e63", weight="bold")
    alice_priv = ft.Text("a = ?", size=14, color="#e91e63")
    alice_pub = ft.Text("aG = ?", size=14, color="#e91e63")
    alice_secret = ft.Text("S = ___", size=20, color="#e91e63", weight="bold")

    # --- Textos de Bob ---
    bob_nombre = ft.Text("Bob", size=18, color="#0d47a1", weight="bold")
    bob_priv = ft.Text("b = ?", size=14, color="#0d47a1")
    bob_pub = ft.Text("bG = ?", size=14, color="#0d47a1")
    bob_secret = ft.Text("S = ___", size=20, color="#0d47a1", weight="bold")

    # --- Flechas cruzadas en la nube ---
    flecha_alice_label = ft.Text("valor\ncompartido", size=12, color="#e91e63",
                                  weight="bold", text_align=ft.TextAlign.CENTER)
    flecha_bob_label = ft.Text("valor\ncompartido", size=12, color="#00bcd4",
                                weight="bold", text_align=ft.TextAlign.CENTER)

    nube = ft.Container(
        content=ft.Stack([
            # Fondo nube
            ft.Container(
                width=300, height=140,
                bgcolor="#e8eaf6",
                border_radius=70,
                border=ft.border.all(3, "#3f51b5"),
            ),
            # Flecha rosa (Alice → Bob) arriba-izquierda a abajo-derecha
            ft.Container(
                content=ft.Row([
                    ft.Icon(ft.Icons.ARROW_FORWARD, color="#e91e63", size=20),
                    flecha_alice_label,
                ], spacing=4, alignment=ft.MainAxisAlignment.CENTER),
                left=20, top=15, width=150, height=50,
            ),
            # Flecha cyan (Bob → Alice) arriba-derecha a abajo-izquierda
            ft.Container(
                content=ft.Row([
                    flecha_bob_label,
                    ft.Icon(ft.Icons.ARROW_BACK, color="#00bcd4", size=20),
                ], spacing=4, alignment=ft.MainAxisAlignment.CENTER),
                right=20, bottom=15, width=150, height=50,
            ),
        ]),
        width=300, height=140,
    )

    # --- Columnas de personas ---
    alice_col = ft.Column([
        persona_icon("#f48fb1", "#f06292"),
        alice_nombre,
        alice_priv,
        alice_pub,
    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=5)

    bob_col = ft.Column([
        persona_icon("#5c6bc0", "#283593"),
        bob_nombre,
        bob_priv,
        bob_pub,
    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=5)

    # ========= LÓGICA =========
    def ejecutar_ecdh(e):
        try:
            ca = int(input_a.value)
            cb = int(input_b.value)
            cp = int(input_p.value)
            gx = int(input_gx.value)
            gy = int(input_gy.value)
            G = (gx, gy)
        except ValueError:
            resultado.value = "❌ Valores inválidos. Ingresa números enteros."
            resultado.color = "#c62828"
            page.update()
            return

        curva_label.value = f"Curva: y² = x³ + {ca}x + {cb}  (mod {cp})   G = {G}"

        a_priv = random.randint(2, 20)
        b_priv = random.randint(2, 20)

        A_pub = multiplicacion_escalar(G, a_priv, ca, cp)
        B_pub = multiplicacion_escalar(G, b_priv, ca, cp)

        S1 = multiplicacion_escalar(B_pub, a_priv, ca, cp)
        S2 = multiplicacion_escalar(A_pub, b_priv, ca, cp)

        # Actualizar textos
        alice_priv.value = f"a = {a_priv}"
        alice_pub.value = f"aG = {A_pub}"
        bob_priv.value = f"b = {b_priv}"
        bob_pub.value = f"bG = {B_pub}"

        flecha_alice_label.value = f"aG = {A_pub}"
        flecha_bob_label.value = f"bG = {B_pub}"

        alice_secret.value = f"S = {S1}"
        bob_secret.value = f"S = {S2}"

        if S1 == S2:
            resultado.value = "✔ ¡Intercambio exitoso! Ambos calcularon el mismo secreto"
            resultado.color = "#2e7d32"
        else:
            resultado.value = "❌ Error en el intercambio"
            resultado.color = "#c62828"

        page.update()

    boton = ft.Button(
        content=ft.Text("Generar Intercambio ECDH", size=16, weight="bold"),
        on_click=ejecutar_ecdh,
        style=ft.ButtonStyle(bgcolor="#3f51b5", color="white", padding=15),
    )

    # ========= LAYOUT =========
    page.add(
        ft.Column([
            ft.Text("🔐 Simulación ECDH", size=28, weight="bold", color="#222222"),

            # Inputs de parámetros
            ft.Row([
                ft.Text("Curva y² = x³ + ax + b (mod p):", size=14, color="#444444"),
                input_a, input_b, input_p,
            ], alignment=ft.MainAxisAlignment.CENTER, spacing=10),
            ft.Row([
                ft.Text("Generador G = (Gx, Gy):", size=14, color="#444444"),
                input_gx, input_gy,
            ], alignment=ft.MainAxisAlignment.CENTER, spacing=10),
            curva_label,
            ft.Container(height=10),

            # Personas + Nube
            ft.Row([
                alice_col,
                nube,
                bob_col,
            ], alignment=ft.MainAxisAlignment.SPACE_AROUND,
               vertical_alignment=ft.CrossAxisAlignment.START),

            ft.Container(height=10),

            # Secretos abajo
            ft.Row([
                alice_secret,
                bob_secret,
            ], alignment=ft.MainAxisAlignment.SPACE_AROUND),

            ft.Container(height=15),
            boton,
            ft.Container(height=5),
            resultado,
        ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=5)
    )

ft.run(main)