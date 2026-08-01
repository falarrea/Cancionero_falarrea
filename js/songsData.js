/**
 * GoodChord - Preloaded Spanish Songbook Database
 * Includes iconic songs with rich chords (basic, jazz, complex extensions, slash chords)
 * categorized by Genre, Rhythm, Artist, Key, and Difficulty.
 */

export const INITIAL_SONGS = [
  {
    id: "song-1",
    title: "Muchacha (Ojos de papel)",
    artist: "Almendra / Luis Alberto Spinetta",
    genre: "Rock Nacional / Acústico",
    rhythm: "4/4 (Balada Acústica)",
    bpm: 76,
    key: "G",
    capo: "Sin capo",
    favorite: true,
    recent: true,
    rawText: `Título: Muchacha (Ojos de papel)
Artista: Almendra / Luis Alberto Spinetta
Tono: G
Ritmo: 4/4 (Balada Acústica)
Género: Rock Nacional / Acústico

[Intro]
G  Gmaj7  Cadd9  G/B  Am7  D7

[Verso 1]
G        Gmaj7  Cadd9     G/B
Muchacha ojos de papel
Am7                D7            G
¿Adónde vas? Quédate hasta el alba
G        Gmaj7   Cadd9    G/B
Muchacha pequeños pies
Am7                 D7             G
No corras más, quédate hasta el alba

[Estribillo]
Em                 Bm7
Sueña un sueño despacito entre mis manos
Cadd9              G/B           Am7     D7
Hasta que nazca el sol de este día
Em                 Bm7
Haz que su vuelo sea un gran lazo
Cadd9              G/B           Am7     D7
Que enmarque tu cuerpo en esta melodía

[Outro]
G  Gmaj7  Cadd9  G/B  Am7  D7  G`
  },
  {
    id: "song-2",
    title: "De Música Ligera",
    artist: "Soda Stereo / Gustavo Cerati",
    genre: "Rock en Español",
    rhythm: "4/4 (Pop Rock)",
    bpm: 125,
    key: "Bm",
    capo: "Sin capo",
    favorite: true,
    recent: true,
    rawText: `Título: De Música Ligera
Artista: Soda Stereo / Gustavo Cerati
Tono: Bm
Ritmo: 4/4 (Pop Rock)
Género: Rock en Español

[Intro]
Bm  G  D  A (x4)

[Verso 1]
Bm       G              D    A
Ella durmió al calor de las masas
Bm        G         D     A
Y yo desperté queriendo soñarla
Bm            G               D       A
Algún tiempo atrás pensé en escribirle
Bm            G                 D        A
Pero el tiempo pasó y hoy no sé de ella

[Estribillo]
Bm      G       D     A
De música ligera
Bm      G       D     A
Nada nos libra, nada más queda

[Solo]
Bm  G  D  A (x2)

[Verso 2]
Bm         G                D        A
No enviaré cenizas de rosas blancas
Bm         G           D         A
Ni fotos rotas en mi memoria

[Estribillo]
Bm      G       D     A
De música ligera
Bm      G       D     A
Nada nos libra, nada más queda... ¡Gracias totales!`
  },
  {
    id: "song-3",
    title: "Hasta la Raíz",
    artist: "Natalia Lafourcade",
    genre: "Folclore Pop",
    rhythm: "4/4 (Huapango / Pop)",
    bpm: 98,
    key: "D",
    capo: "Capo 2do traste",
    favorite: true,
    recent: false,
    rawText: `Título: Hasta la Raíz
Artista: Natalia Lafourcade
Tono: D
Ritmo: 4/4 (Huapango / Pop)
Género: Folclore Pop

[Intro]
D  F#m  Bm7  Gadd9 (x2)

[Verso 1]
D                          F#m
Sigo cruzando ríos, andando caminos
           Bm7                   Gadd9
Viendo las luces de la ciudad
D                          F#m
Sigo cantando historias, guardando recuerdos
         Bm7                     Gadd9
En el cofre de mi soledad

[Estribillo]
D                     F#m7
Yo te llevo dentro, hasta la raíz
        Bm7                          Gadd9
Y por más que crezca, vas a estar aquí
D                     F#m7
Aunque yo me oculte tras la montaña
           Bm7                       Gadd9
Y encuentre un campo lleno de caña

[Puente]
Em7         F#m7
Construiré un nido de amor
Gadd9       A7sus4
Donde el viento abrigue el corazón`
  },
  {
    id: "song-4",
    title: "Luna Tucumana",
    artist: "Atahualpa Yupanqui / Mercedes Sosa",
    genre: "Folclore Argentino",
    rhythm: "3/4 (Zamba Tradicional)",
    bpm: 68,
    key: "Am",
    capo: "Sin capo",
    favorite: false,
    recent: true,
    rawText: `Título: Luna Tucumana
Artista: Atahualpa Yupanqui / Mercedes Sosa
Tono: Am
Ritmo: 3/4 (Zamba Tradicional)
Género: Folclore Argentino

[Intro]
Am  E7  Am  G7  C  E7  Am

[Verso 1]
Am                    E7
Yo no le canto a la luna
                     Am
Porque alumbra y nada más
C                   G7
Le canto porque ella sabe
F                   E7
De mi largo caminar

[Estribillo]
A7                  Dm
Ay luna tucumana, tamboril de mi dolor
G7                  C
En la alborada del cerro
F            E7     Am
Sos caballito de sol

[Interludio]
Am  Dm  E7  Am`
  },
  {
    id: "song-5",
    title: "11 y 6",
    artist: "Fito Páez",
    genre: "Rock Nacional",
    rhythm: "4/4 (Balada Rock)",
    bpm: 84,
    key: "G",
    capo: "Sin capo",
    favorite: true,
    recent: false,
    rawText: `Título: 11 y 6
Artista: Fito Páez
Tono: G
Ritmo: 4/4 (Balada Rock)
Género: Rock Nacional

[Intro]
G  D/F#  Em7  Cadd9  D7

[Verso 1]
G             D/F#         Em7
En un café se sientan a mirar
Cadd9        G/B          Am7       D7
Las rosas que alguien dejó al pasar
G             D/F#          Em7
El tiene once, ella tiene seis
Cadd9         D7          G
Y el amor entre ellos es de ley

[Estribillo]
Em            Bm7
Miren a los dos, caminando por Corrientes
Cadd9         G/B           Am7       D7
Ella lleva un ramo de flores de colores
Em            Bm7
Y el le da la mano con tanta dulzura
Cadd9         D7            G
Que la noche entera pierde la amargura`
  },
  {
    id: "song-6",
    title: "Te Guardo",
    artist: "Silvana Estrada",
    genre: "Jazz Folclórico",
    rhythm: "3/4 (Valseado Jazz)",
    bpm: 72,
    key: "Cmaj7",
    capo: "Capo 3er traste",
    favorite: true,
    recent: true,
    rawText: `Título: Te Guardo
Artista: Silvana Estrada
Tono: Cmaj7
Ritmo: 3/4 (Valseado Jazz)
Género: Jazz Folclórico

[Intro]
Cmaj7  F#m7b5  Fmaj7  G13

[Verso 1]
Cmaj7              F#m7b5
Te guardo en un rincón de mi memoria
Fmaj7              G13
Donde el tiempo no borre esta historia
Cmaj7              F#m7b5
Donde el viento se vuelva poesía
Fmaj7              E7sus4      E7
Y la noche me regale tu alegría

[Estribillo]
Dm9                G13
Te guardo despacito, te guardo en el alma
Cmaj7              Am9
Como se guarda el mar en la calma
Dm9                G13
Si vuelves algún día, aquí estará mi flor
Fmaj7              G13         Cmaj7
Esperando el milagro de tu amor`
  },
  {
    id: "song-7",
    title: "Tus Ojos",
    artist: "Los Cafres",
    genre: "Reggae",
    rhythm: "4/4 (Reggae Off-Beat)",
    bpm: 78,
    key: "Em",
    capo: "Sin capo",
    favorite: false,
    recent: false,
    rawText: `Título: Tus Ojos
Artista: Los Cafres
Tono: Em
Ritmo: 4/4 (Reggae Off-Beat)
Género: Reggae

[Intro]
Em  Am  Bm7  Em (x2)

[Verso 1]
Em                 Am
Tus ojos me llevan a un lugar
Bm7                Em
Donde las horas dejan de pasar
Em                 Am
Tus ojos son la luz en mi camino
Bm7                Em
Un faro en medio de mi destino

[Estribillo]
Cadd9              D
Y yo quiero estar contigo
G         D/F#     Em
Sentir el calor de tu abrigo
Cadd9              D
Bailar al ritmo del mar
Bm7                Em
Y nunca dejarte de amar`
  }
];
