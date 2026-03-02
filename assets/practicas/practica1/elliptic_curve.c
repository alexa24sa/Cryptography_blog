/* =====================================================
   CURVAS ELIPTICAS SOBRE CAMPOS FINITOS
   Ecuacion: y^2 = x^3 + ax + b  (mod p)

   Practica 1 — Criptografia
   Escuela Superior de Computo — ESCOM IPN

   Compilar:  gcc elliptic_curve.c -o elliptic -lm
   Ejecutar:  ./elliptic
   Con args:  ./elliptic <a> <b> <p>
   Ejemplo:   ./elliptic 4 4 11
              ./elliptic -5 6 11
   ===================================================== */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

/* --------------------------------------------------
   Modulo garantizado positivo
   Necesario cuando a es negativo: (-5) % 11 = -5 en C,
   pero queremos el representante positivo = 6.
   -------------------------------------------------- */
long long mod_pos(long long a, long long m) {
    return ((a % m) + m) % m;
}

/* --------------------------------------------------
   Exponenciacion modular rapida: base^exp mod m
   Algoritmo de cuadrado y multiplicacion.
   Complejidad: O(log exp).
   Evita desbordamiento multiplicando modularmente.
   -------------------------------------------------- */
long long mod_pow(long long base, long long exp, long long m) {
    if (m == 1) return 0;
    long long result = 1;
    base = mod_pos(base, m);
    while (exp > 0) {
        if (exp % 2 == 1)
            result = mod_pos(result * base, m);
        exp /= 2;
        base = mod_pos(base * base, m);
    }
    return result;
}

/* --------------------------------------------------
   Prueba de primalidad por division hasta sqrt(n).
   Para uso educativo con primos pequenos (p < 10000).
   -------------------------------------------------- */
int es_primo(long long n) {
    if (n < 2) return 0;
    if (n == 2) return 1;
    if (n % 2 == 0) return 0;
    for (long long i = 3; i * i <= n; i += 2)
        if (n % i == 0) return 0;
    return 1;
}

/* --------------------------------------------------
   Imprime una linea de separacion de longitud `len`
   usando el caracter `c`.
   -------------------------------------------------- */
void sep(int len, char c) {
    for (int i = 0; i < len; i++) putchar(c);
    putchar('\n');
}

/* ==================================================
   FUNCION PRINCIPAL
   ================================================== */
int main(int argc, char *argv[]) {

    long long a, b, p;

    /* -- Banner -- */
    printf("\n");
    sep(64, '=');
    printf("  CURVA ELIPTICA:  y^2 = x^3 + ax + b  (mod p)\n");
    printf("  Criptografia -- Practica 1 | ESCOM IPN\n");
    sep(64, '=');
    printf("\n");

    /* -- Leer parametros -- */
    if (argc >= 4) {
        a = atoll(argv[1]);
        b = atoll(argv[2]);
        p = atoll(argv[3]);
        printf("  Parametros (linea de comandos):\n");
        printf("    a = %lld\n    b = %lld\n    p = %lld\n\n", a, b, p);
    } else {
        printf("  Ingrese el coeficiente a : "); scanf("%lld", &a);
        printf("  Ingrese el coeficiente b : "); scanf("%lld", &b);
        printf("  Ingrese el primo       p : "); scanf("%lld", &p);
        printf("\n");
    }

    /* -- Validaciones -- */
    if (p < 2) {
        printf("  [ERROR] p debe ser >= 2.\n");
        return 1;
    }
    if (!es_primo(p)) {
        printf("  [ERROR] %lld no es primo. La curva eliptica requiere p primo.\n", p);
        return 1;
    }

    printf("  Curva: y^2 = x^3");
    if (a > 0) printf(" + %lldx", a);
    else if (a < 0) printf(" - %lldx", -a);
    if (b > 0) printf(" + %lld", b);
    else if (b < 0) printf(" - %lld", -b);
    printf("  (mod %lld)\n\n", p);

    /* ================================================
       PASO 1: Verificacion del discriminante
       Condicion para curva no singular:
           Delta = 4a^3 + 27b^2  !=  0  (mod p)
       ================================================ */

    sep(64, '-');
    printf("  PASO 1: Verificacion de Curva Valida\n");
    printf("  Condicion: Delta = 4a^3 + 27b^2  !=  0  (mod %lld)\n", p);
    sep(64, '-');
    printf("\n");

    long long a_mp  = mod_pos(a, p);       /* a mod p */
    long long b_mp  = mod_pos(b, p);       /* b mod p */
    long long a3    = mod_pow(a_mp, 3, p); /* a^3 mod p */
    long long b2    = mod_pos(b_mp * b_mp, p); /* b^2 mod p */
    long long term1 = mod_pos(4  * a3, p); /* 4a^3 mod p */
    long long term2 = mod_pos(27 * b2, p); /* 27b^2 mod p */
    long long disc  = mod_pos(term1 + term2, p); /* Delta */

    printf("  a mod %lld      = %lld\n", p, a_mp);
    printf("  b mod %lld      = %lld\n\n", p, b_mp);

    printf("  a^3 mod %lld   = %lld^3 mod %lld  =  %lld\n",
           p, a_mp, p, a3);
    printf("  b^2 mod %lld   = %lld^2 mod %lld  =  %lld\n\n",
           p, b_mp, p, b2);

    printf("  4  * a3  =  4  * %lld  =  %-8lld  ->  4a^3  mod %lld  =  %lld\n",
           a3, 4*a3, p, term1);
    printf("  27 * b2  =  27 * %lld  =  %-8lld  ->  27b^2 mod %lld  =  %lld\n\n",
           b2, 27*b2, p, term2);

    printf("  Delta = %lld + %lld  =  %lld  mod %lld  =  %lld\n\n",
           term1, term2, term1 + term2, p, disc);

    if (disc == 0) {
        printf("  [!] CURVA NO VALIDA: Delta = 0  (curva singular, no forma grupo)\n\n");
        return 1;
    }
    printf("  [OK] CURVA VALIDA: Delta = %lld  (distinto de 0)\n", disc);

    /* -- Reservar memoria para las dos tablas -- */
    long long *z  = (long long *)malloc(p * sizeof(long long));
    long long *y2 = (long long *)malloc(p * sizeof(long long));
    if (!z || !y2) {
        printf("  [ERROR] No se pudo reservar memoria.\n");
        free(z); free(y2);
        return 1;
    }

    /* ================================================
       PASO 2: Tabla  z = x^3 + ax + b  (mod p)
       Para cada x en [0, p-1] calculamos z(x).
       Si z(x) es residuo cuadratico mod p,
       x sera coordenada de un punto de la curva.
       ================================================ */

    printf("\n\n");
    sep(64, '-');
    printf("  PASO 2: Tabla  z = x^3 + (%lld)x + (%lld)  (mod %lld)\n", a, b, p);
    sep(64, '-');
    printf("\n");
    printf("  %-4s | %-48s | z\n", "x", "Calculo detallado");
    printf("  -----|--------------------------------------------------|----\n");

    for (long long x = 0; x < p; x++) {

        long long x3r = x * x * x;      /* x^3 sin mod (valor real) */
        long long axr = a * x;          /* a*x sin mod (puede ser negativo) */
        long long raw = x3r + axr + b;  /* suma total sin mod */
        z[x]          = mod_pos(raw, p); /* resultado modular */

        /* Construir la cadena de calculo mostrando signos correctos */
        long long ax_abs = (axr < 0) ? -axr : axr;
        long long b_abs  = (b   < 0) ? -b   :  b;
        char s_ax = (axr >= 0) ? '+' : '-';
        char s_b  = (b   >= 0) ? '+' : '-';

        char calc[128];
        snprintf(calc, sizeof(calc),
            "%lld^3 %c %lld %c %lld = %lld %c %lld %c %lld = %lld",
            x,
            s_ax, ax_abs, s_b, b_abs,   /* formula simbolica */
            x3r,
            s_ax, ax_abs, s_b, b_abs,   /* valores numericos */
            raw);                        /* suma total */

        printf("  %-4lld | %-48s | %lld\n", x, calc, z[x]);
    }

    /* ================================================
       PASO 3: Tabla de residuos cuadraticos
           y^2 mod p,  para y en [0, p-1]
       Estos son los valores que z(x) debe igualar
       para que x sea coordenada de un punto.
       ================================================ */

    printf("\n\n");
    sep(64, '-');
    printf("  PASO 3: Tabla  y^2  mod %lld  (Residuos cuadraticos)\n", p);
    sep(64, '-');
    printf("\n");
    printf("  %-4s | %-24s | y^2 mod %lld\n", "y", "Calculo", p);
    printf("  -----|--------------------------|----------\n");

    for (long long y = 0; y < p; y++) {
        y2[y] = mod_pos(y * y, p);
        printf("  %-4lld | %lld^2 = %-16lld | %lld\n",
               y, y, y * y, y2[y]);
    }

    /* ================================================
       PASO 4: Encontrar coincidencias  z(x) = y^2(y)
       Un par (x, y) pertenece a E si y solo si:
           x^3 + ax + b  =  y^2  (mod p)
       ================================================ */

    printf("\n\n");
    sep(64, '-');
    printf("  PASO 4: Puntos de la curva  [ z(x) = y^2(y) ]\n");
    sep(64, '-');
    printf("\n");

    int count = 1;  /* Empezar en 1: el punto al infinito siempre pertenece */
    printf("  O  (Punto al infinito -- siempre pertenece al grupo)\n");

    for (long long x = 0; x < p; x++)
        for (long long y = 0; y < p; y++)
            if (y2[y] == z[x]) {
                printf("  (%2lld, %2lld)  ->  z[%lld] = %lld  ==  y^2[%lld] = %lld  [PUNTO VALIDO]\n",
                       x, y, x, z[x], y, y2[y]);
                count++;
            }

    /* ================================================
       RESULTADO FINAL
       Conjunto E completo y cardinalidad |E|
       ================================================ */

    printf("\n");
    sep(64, '=');
    printf("  RESULTADO FINAL\n");
    sep(64, '=');
    printf("\n  Curva: y^2 = x^3");
    if (a > 0) printf(" + %lldx", a);
    else if (a < 0) printf(" - %lldx", -a);
    if (b > 0) printf(" + %lld", b);
    else if (b < 0) printf(" - %lld", -b);
    printf("  (mod %lld)\n\n", p);

    printf("  E = { O");
    for (long long x = 0; x < p; x++)
        for (long long y = 0; y < p; y++)
            if (y2[y] == z[x])
                printf(", (%lld, %lld)", x, y);
    printf(" }\n\n");

    printf("  Puntos afines:  %d\n", count - 1);
    printf("  Punto al inf.:  1  (O)\n");
    printf("  |E|          =  %d\n\n", count);

    sep(64, '=');

    /* -- Liberar memoria -- */
    free(z);
    free(y2);
    return 0;
}
