import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Formule {
  nom: string;
  prix: number;
  prixLabel: string;
  description: string;
  duree: string;
  photos: string;
  livraison: string;
  inclus: string[];
  populaire?: boolean;
}

interface Prestation {
  id: string;
  categorie: string;
  icone: string;
  sousTitre: string;
  formules: Formule[];
}

@Component({
  selector: 'app-tarifs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tarifs.component.html',
  styleUrls: ['./tarifs.component.css']
})
export class TarifsComponent {

  readonly WHATSAPP_NUMBER = '221773012470';

  get whatsappGeneralUrl(): string {
    const msg = encodeURIComponent('Bonjour, je souhaite obtenir un devis personnalisé pour une séance photo. Pouvez-vous me contacter ?');
    return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${msg}`;
  }

  getWhatsappUrl(prestation: Prestation, formule: Formule): string {
    const msg = encodeURIComponent(
      `Bonjour 👋, je suis intéressé(e) par la formule *${formule.nom}* — *${prestation.categorie}* (${formule.prixLabel} FCFA).\nPouvez-vous me donner plus d'informations et vérifier vos disponibilités ?`
    );
    return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${msg}`;
  }

  activeTab = 0;

  setTab(index: number): void {
    this.activeTab = index;
  }

  prestations: Prestation[] = [
    {
      id: 'mariage',
      categorie: 'Mariage & Événement',
      icone: '💍',
      sousTitre: 'Couverture complète de votre grand jour, de la préparation à la soirée.',
      formules: [
        {
          nom: 'Essentiel',
          prix: 150000,
          prixLabel: 'à partir de 150 000',
          description: 'Idéal pour les cérémonies intimistes',
          duree: '4 heures',
          photos: '150 photos',
          livraison: '3 semaines',
          inclus: [
            'Cérémonie & vin d\'honneur',
            'Galerie en ligne privée',
            'Fichiers haute résolution',
            'Retouches couleur incluses'
          ]
        },
        {
          nom: 'Premium',
          prix: 250000,
          prixLabel: 'à partir de 250 000',
          description: 'La formule la plus demandée',
          duree: '8 heures',
          photos: '300 photos',
          livraison: '2 semaines',
          inclus: [
            'Cérémonie, vin d\'honneur & soirée',
            'Galerie en ligne privée',
            'Fichiers haute résolution',
            'Album photo 30×30 cm inclus',
            'Séance engagement offerte'
          ],
          populaire: true
        },
        {
          nom: 'Prestige',
          prix: 400000,
          prixLabel: 'à partir de 400 000',
          description: 'Une couverture sans compromis',
          duree: '2 jours',
          photos: '500+ photos',
          livraison: '10 jours',
          inclus: [
            'Couverture 2 jours complète',
            'Vidéo highlight 3–5 min',
            'Galerie en ligne privée',
            'Album photo 40×40 cm',
            'Séance engagement offerte',
            'Tirage fine art 50×70 cm'
          ]
        }
      ]
    },
    {
      id: 'domicile',
      categorie: 'Photo à domicile',
      icone: '🏠',
      sousTitre: 'Des portraits authentiques dans votre espace de vie, en famille ou en solo.',
      formules: [
        {
          nom: 'Mini séance',
          prix: 40000,
          prixLabel: 'à partir de 40 000',
          description: 'Parfait pour un souvenir rapide',
          duree: '45 minutes',
          photos: '20 photos',
          livraison: '1 semaine',
          inclus: [
            'Jusqu\'à 4 personnes',
            'Galerie en ligne',
            'Fichiers haute résolution'
          ]
        },
        {
          nom: 'Famille',
          prix: 75000,
          prixLabel: 'à partir de 75 000',
          description: 'Capturez la vie de famille',
          duree: '1h30',
          photos: '50 photos',
          livraison: '1 semaine',
          inclus: [
            'Jusqu\'à 8 personnes',
            'Plusieurs ambiances & pièces',
            'Galerie en ligne',
            'Tirages 20×30 cm (×5)'
          ],
          populaire: true
        },
        {
          nom: 'Portrait Pro',
          prix: 60000,
          prixLabel: 'à partir de 60 000',
          description: 'Pour votre image professionnelle',
          duree: '1 heure',
          photos: '30 photos',
          livraison: '5 jours',
          inclus: [
            'Séance individuelle',
            'Galerie en ligne',
            'Retouches avancées',
            'Droits d\'usage commerciaux inclus'
          ]
        }
      ]
    },
    {
      id: 'studio',
      categorie: 'Photo en studio',
      icone: '📸',
      sousTitre: 'Portraits créatifs et professionnels avec éclairages maîtrisés et décors variés.',
      formules: [
        {
          nom: 'Solo',
          prix: 35000,
          prixLabel: 'à partir de 35 000',
          description: 'Séance individuelle en studio',
          duree: '1 heure',
          photos: '25 photos',
          livraison: '5 jours',
          inclus: [
            '1 tenue',
            '2 fonds au choix',
            'Galerie en ligne',
            'Fichiers haute résolution'
          ]
        },
        {
          nom: 'Duo / Couple',
          prix: 55000,
          prixLabel: 'à partir de 55 000',
          description: 'Pour une séance à deux',
          duree: '1h30',
          photos: '40 photos',
          livraison: '5 jours',
          inclus: [
            '3 tenues',
            'Fonds illimités',
            'Galerie en ligne',
            'Maquillage conseil inclus'
          ],
          populaire: true
        },
        {
          nom: 'Corporate',
          prix: 80000,
          prixLabel: 'à partir de 80 000',
          description: 'Photos pros pour votre équipe',
          duree: 'Demi-journée',
          photos: '80 photos',
          livraison: '5 jours',
          inclus: [
            'Jusqu\'à 10 personnes',
            'Décors corporate & créatifs',
            'Retouches avancées',
            'Droits commerciaux inclus'
          ]
        }
      ]
    }
  ];

  formatPrix(prix: number): string {
    return prix.toLocaleString('fr-FR') + ' FCFA';
  }

  get activePrestation(): Prestation {
    return this.prestations[this.activeTab];
  }

  // Lignes du tableau comparatif
  readonly comparaisonLabels = [
    { key: 'duree',     label: '⏱ Durée',     icon: 'clock' },
    { key: 'photos',    label: '🖼 Photos',    icon: 'image' },
    { key: 'livraison', label: '📦 Livraison', icon: 'box' },
  ];
}
