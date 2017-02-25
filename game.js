(function () {
    "use strict";

    //Variables globales
    var canvas, ctx, largeurCanvas, hauteurCanvas,
        raquetteJ1, raquetteJ2, balle,
        scoreJ1 = 0,
        scoreJ2 = 0,
        engagement = '',
        couleurJ1 = '#003366',
        couleurJ2 = '#960018',
        couleurBalle = 'white',
        deltaBalleX = 200,
        deltaBalleY = 200,
        touches = {
            'hautJ1': false, //Z
            'basJ1': false, //S
            'hautJ2': false, //HAUT
            'basJ2': false //BAS
        };

    //Fonction qui calcule la distance de déplacement d'un objet
    function calcDeplacement(delta, speed) {
        return speed * delta / 1000;
    }

    //Code d'un objet général
    function ObjetJeu(positionX, positionY, largeur, hauteur, vitesseX, vitesseY, color) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.largeur = largeur;
        this.hauteur = hauteur;
        this.vitesseX = vitesseX;
        this.vitesseY = vitesseY;
        this.color = color;
    }

    //Ajout d'une fonction pour afficher l'objet
    ObjetJeu.prototype.dessiner = function () {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.rect(this.positionX, this.positionY, this.largeur, this.hauteur);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    //Code de l'objet Raquette qui hérite de ObjetJeu
    function Raquette(positionX, positionY, largeur, hauteur, vitesseX, vitesseY, color) {
        //On fait appel au constructeur de l'objet parent
        ObjetJeu.call(this, positionX, positionY, largeur, hauteur, vitesseX, vitesseY, color);
    }

    //On récupère les méthodes de l'objet parent dans Raquette
    Raquette.prototype = Object.create(ObjetJeu.prototype);

    /* Fonction qui teste si la raquette est entrée en collision avec le décor sur l'axe Y 
     *
     * La première condition vérifie une collision avec le haut du canvas
     * La seconde condition vérifie une collision avec le bas du canvas
     *
     */
    Raquette.prototype.collision = function (delta) {
        if (delta < 0 && this.positionY <= 0) {
            return true;
        } else if (delta > 0 && this.positionY >= (hauteurCanvas - this.hauteur)) {
            return true;
        }

        return false;
    };

    //Ajout de la méthode de déplacement propre à une raquette
    Raquette.prototype.deplacer = function (delta) {
        if (!this.collision(delta)) {
            //On efface la raquette pour la redessiner plus tard
            ctx.clearRect(this.positionX, this.positionY, this.largeur, this.hauteur);

            //On récupère la nouvelle position sur l'axe Y
            this.positionY += calcDeplacement(delta, this.vitesseY);

            //On redessine la raquette
            this.dessiner();
        }
    };

    //Code de l'objet Balle qui hérite de ObjetJeu
    function Balle(positionX, positionY, largeur, hauteur, vitesseX, vitesseY, color) {
        //On fait appel au constructeur de l'objet parent
        ObjetJeu.call(this, positionX, positionY, largeur, hauteur, vitesseX, vitesseY, color);
    }

    //On récupère les méthodes de l'objet parent dans Raquette
    Balle.prototype = Object.create(ObjetJeu.prototype);

    Balle.prototype.dessiner = function () {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.arc(this.positionX, this.positionY, this.largeur, this.hauteur, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    //Ajout de la méthode de déplacement propre à une balle
    Balle.prototype.deplacer = function () {
        this.rebond();
        //On efface la balle pour la redessiner plus tard
        ctx.clearRect(this.positionX, this.positionY, this.largeur, this.hauteur);

        //On récupère la nouvelle position sur l'axe X et Y
        this.positionX += calcDeplacement(deltaBalleX, this.vitesseX);
        this.positionY += calcDeplacement(deltaBalleY, this.vitesseY);

        //On redessine la balle
        this.dessiner();
    };

    /* Fonction qui gère le rebond de la balle lors d'une collision avec une raquette ou l'environnement
     *
     * On teste si la balle est entré en contact avec une raquette
     * Dans ce cas elle rebondit et repart dans l'autre sens
     *
     * Sinon on vérifie si elle est sortie du décor
     * Dans ce cas là, l'un des joueurs marque un point et engage
     */
    Balle.prototype.rebond = function () {
        if (balle.positionX >= (raquetteJ2.positionX - balle.largeur) && balle.positionY >= raquetteJ2.positionY && balle.positionY <= (raquetteJ2.positionY + raquetteJ2.hauteur)) {
            deltaBalleX = -200;

            if (touches.hautJ2) {
                deltaBalleY = -200;
            } else if (touches.basJ2) {
                deltaBalleY = 200;
            }
        } else if (balle.positionX <= (raquetteJ1.positionX + raquetteJ1.largeur) && balle.positionY >= raquetteJ1.positionY && balle.positionY <= (raquetteJ1.positionY + raquetteJ1.hauteur)) {
            deltaBalleX = 200;

            if (touches.hautJ1) {
                deltaBalleY = -200;
            } else if (touches.basJ1) {
                deltaBalleY = 200;
            }
        } else if (balle.positionY <= 0 || balle.positionY >= (hauteurCanvas - balle.hauteur) && (balle.positionX >= (raquetteJ1.positionX + raquetteJ1.largeur) && balle.positionX <= (raquetteJ2.positionX - balle.largeur))) {
            deltaBalleY = -deltaBalleY;
        } else if (balle.positionX <= raquetteJ1.positionX && (balle.positionY <= (raquetteJ1.positionY - balle.hauteur) || balle.positionY >= (raquetteJ1.positionY + raquetteJ1.hauteur + balle.hauteur))) {
            scoreJ2 += 1;
            engagement = 'J2';
            this.reinit();
        } else if (balle.positionX >= raquetteJ2.positionX && (balle.positionY <= (raquetteJ2.positionY - balle.hauteur) || balle.positionY >= (raquetteJ2.positionY + raquetteJ2.hauteur + balle.hauteur))) {
            scoreJ1 += 1;
            engagement = 'J1';
            this.reinit();
        }
    };

    /* Fonction qui réinitialise la position de la balle lorsqu'un joueur marque un point
     *
     * Si c'est au joueur 1 d'engager, on positionne la balle près de sa raquette
     * Sinon on place la balle près de la raquette du joueur 2
     */
    Balle.prototype.reinit = function () {
        if (engagement === 'J1') {
            this.positionX = raquetteJ1.positionX + raquetteJ1.largeur + this.largeur;
            this.positionY = raquetteJ1.positionY + (raquetteJ1.hauteur / 2) - (balle.hauteur / 2);
        } else if (engagement === 'J2') {
            this.positionX = raquetteJ2.positionX - this.largeur;
            this.positionY = raquetteJ2.positionY + (raquetteJ2.hauteur / 2) - (balle.hauteur / 2);
        }

        this.vitesseX = 0;
        this.vitesseY = 0;
    };

    //Fonction gérant les mouvements des raquettes
    function dplctRaquette() {
        //Touches du Joueur 1 : Z et S
        if (touches.hautJ1) {
            raquetteJ1.deplacer(-400);
        }

        if (touches.basJ1) {
            raquetteJ1.deplacer(400);
        }

        //Touches du Joueur 2 : Haut et Bas
        if (touches.hautJ2) {
            raquetteJ2.deplacer(-400);
        }

        if (touches.basJ2) {
            raquetteJ2.deplacer(400);
        }

        //Engagement du joueur
        if (balle.vitesseX === 0 && balle.vitesseY === 0 && engagement === 'J1') {
            balle.positionY = raquetteJ1.positionY + (raquetteJ1.hauteur / 2) - (balle.hauteur / 2);
        }

        if (balle.vitesseX === 0 && balle.vitesseY === 0 && engagement === 'J2') {
            balle.positionY = raquetteJ2.positionY + (raquetteJ2.hauteur / 2) - (balle.hauteur / 2);
        }

        setTimeout(dplctRaquette, 1);
    }

    //Fonction gérant l'affichage du filet et du score des joueurs
    function affichageScore() {
        ctx.save();

        //Affichage du score des joueurs
        ctx.lineWidth = 1;
        ctx.strokeStyle = couleurJ1;
        ctx.fillStyle = couleurJ1;
        ctx.fillText(scoreJ1, largeurCanvas / 2 - 100, hauteurCanvas / 2 + 30);
        ctx.strokeStyle = couleurJ2;
        ctx.fillStyle = couleurJ2;
        ctx.fillText(scoreJ2, largeurCanvas / 2 + 20, hauteurCanvas / 2 + 30);

        //Affichage du filet central
        ctx.beginPath();
        ctx.strokeStyle = couleurBalle;
        ctx.lineWidth = 2;
        ctx.moveTo(largeurCanvas / 2, 0);
        ctx.lineTo(largeurCanvas / 2, hauteurCanvas);
        ctx.stroke();

        ctx.restore();
    }

    //Fonction qui redessine le terrain de jeu à interval régulier
    function dessinerJeu(delta) {
        ctx.clearRect(0, 0, largeurCanvas, hauteurCanvas);

        affichageScore();
        balle.deplacer(delta);
        raquetteJ1.dessiner();
        raquetteJ2.dessiner();

        setTimeout(dessinerJeu, 5, delta);
    }

    //Fonction principale de notre jeu
    function init() {
        //On récupère le canvas
        canvas = document.querySelector("#Pong");

        //On récupère la largeur et la hauteur du canvas
        largeurCanvas = canvas.width;
        hauteurCanvas = canvas.height;

        //Récupération du contexte
        ctx = canvas.getContext('2d');
        ctx.font = "150px Calibri,Geneva,Arial";

        //On crée les objets du jeu
        raquetteJ1 = new Raquette(10, hauteurCanvas / 2 - 100, 15, 120, 20, 20, couleurJ1);
        raquetteJ2 = new Raquette(largeurCanvas - 30, hauteurCanvas / 2 - 100, 15, 120, 20, 20, couleurJ2);
        balle = new Balle(largeurCanvas / 2, hauteurCanvas / 2, 8, 0, 0, 0, couleurBalle);

        //On capte les déplacements clavier des joueurs
        window.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                //Controle du joueur 1 : Touches Z et S
            case 90: //Z
                touches.hautJ1 = true;
                break;
            case 83: //S               
                touches.basJ1 = true;
                break;
                //Controle du joueur 2 : Touches Haut et Bas
            case 38: //Haut
                touches.hautJ2 = true;
                break;
            case 40: //Bas
                touches.basJ2 = true;
                break;
            }
        }, false);

        window.addEventListener('keyup', function (event) {
            switch (event.keyCode) {
                //Controle du joueur 1 : Touches Z et S
            case 90: //Z
                touches.hautJ1 = false;
                break;
            case 83: //S               
                touches.basJ1 = false;
                break;
                //Controle du joueur 2 : Touches Haut et Bas
            case 38: //Haut
                touches.hautJ2 = false;
                break;
            case 40: //Bas
                touches.basJ2 = false;
                break;
            }
        }, false);

        //On capte le click droit de la souris qui signale le début de la partie
        canvas.addEventListener('click', function () {
            if (balle.vitesseX === 0 && balle.vitesseY === 0) {
                balle.vitesseX = balle.vitesseY = 20;
            }
        }, false);

        //On capte la touche espace qui marque le lancement de la balle
        window.addEventListener('keydown', function (event) {
            if (balle.vitesseX === 0 && balle.vitesseY === 0) {
                switch (event.keyCode) {
                case 13:
                case 32:
                    balle.vitesseX = balle.vitesseY = 20;
                    break;
                }
            }

        }, false);

        //Déplacement de la balle
        dessinerJeu(deltaBalleX);
        dplctRaquette();
    }

    init();
}());