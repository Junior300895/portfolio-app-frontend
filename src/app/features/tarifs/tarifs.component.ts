import { Component, OnInit, inject, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Version {
  label: string;
  prix: number;
  icone: string;
}

interface Forfait {
  numero: number;
  photos: number;
  versions: Version[];
  populaire?: boolean;
  galerieOfferte?: boolean;
}

interface Categorie {
  id: string;
  titre: string;
  icone: string;
  description: string;
  forfaits: Forfait[];
  notes: string[];
}

@Component({
  selector: 'app-tarifs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tarifs.component.html',
  styleUrls: ['./tarifs.component.css']
})
export class TarifsComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  readonly WHATSAPP = '221774602558';
  activeTab = signal<string>('evenement');

  categories: Categorie[] = [
    {
      id: 'evenement',
      titre: 'Événements & Mariages',
      icone: '💍',
      description: 'Couverture photo complète de votre événement avec livraison numérique ou album photo.',
      forfaits: [
        {
          numero: 1, photos: 60,
          versions: [
            { label: 'Version numérique', prix: 65000, icone: '💻' },
            { label: 'Album + Numérique', prix: 85000, icone: '📔' }
          ]
        },
        {
          numero: 2, photos: 80,
          versions: [
            { label: 'Version numérique', prix: 85000, icone: '💻' },
            { label: 'Album + Numérique', prix: 110000, icone: '📔' }
          ]
        },
        {
          numero: 3, photos: 100,
          versions: [
            { label: 'Version numérique', prix: 115000, icone: '💻' },
            { label: 'Album + Numérique', prix: 145000, icone: '📔' }
          ],
          populaire: true,
          galerieOfferte: true
        },
        {
          numero: 4, photos: 120,
          versions: [
            { label: 'Version numérique', prix: 115000, icone: '💻' },
            { label: 'Album + Numérique', prix: 150000, icone: '📔' }
          ],
          galerieOfferte: true
        },
        {
          numero: 5, photos: 160,
          versions: [
            { label: 'Version numérique', prix: 180000, icone: '💻' },
            { label: 'Album + Numérique', prix: 210000, icone: '📔' }
          ],
          galerieOfferte: true
        },
        {
          numero: 6, photos: 180,
          versions: [
            { label: 'Version numérique', prix: 200000, icone: '💻' },
            { label: 'Album + Numérique', prix: 230000, icone: '📔' }
          ],
          galerieOfferte: true
        },
        {
          numero: 7, photos: 200,
          versions: [
            { label: 'Version numérique', prix: 220000, icone: '💻' },
            { label: 'Album + Numérique', prix: 250000, icone: '📔' }
          ],
          galerieOfferte: true
        }
      ],
      notes: [
        'Un acompte de 50% est obligatoire pour la validation de la réservation.',
        "L'album vous sera remis dans un délai de 10 jours maximum après l'événement, à compter du jour du paiement du solde.",
        'Aucune photo ne sera livrée tant que le solde restant n\'est pas réglé.'
      ]
    },
    {
      id: 'henne',
      titre: 'Henné Time',
      icone: '🌿',
      description: 'Séance photo spéciale henné pour immortaliser ce moment unique avant le grand jour.',
      forfaits: [
        {
          numero: 1, photos: 10,
          versions: [{ label: 'Version numérique', prix: 18000, icone: '💻' }]
        },
        {
          numero: 2, photos: 15,
          versions: [{ label: 'Version numérique', prix: 24000, icone: '💻' }]
        },
        {
          numero: 3, photos: 20,
          versions: [{ label: 'Version numérique', prix: 30000, icone: '💻' }],
          populaire: true
        },
        {
          numero: 4, photos: 25,
          versions: [{ label: 'Version numérique', prix: 35000, icone: '💻' }]
        }
      ],
      notes: [
        'Un acompte de 50% est obligatoire pour la validation de la réservation.'
      ]
    }
  ];

  get activeCategorie(): Categorie {
    return this.categories.find(c => c.id === this.activeTab()) ?? this.categories[0];
  }

  ngOnInit() {
    this.titleService.setTitle('Tarifs — TIPEU PHOTOGRAPHY');
    this.metaService.updateTag({
      name: 'description',
      content: 'Découvrez les tarifs de TIPEU Photography : forfaits événements, mariages et henné à Dakar. Livraison numérique ou album photo.'
    });
  }

  formatPrix(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  whatsappLink(forfait: Forfait, version: Version): string {
    const msg = encodeURIComponent(
      `Bonjour 👋, je suis intéressé(e) par le *Forfait ${forfait.numero}* — *${forfait.photos} photos* (${version.label}) à *${this.formatPrix(version.prix)} FCFA* pour *${this.activeCategorie.titre}*. Pouvez-vous me confirmer vos disponibilités ?`
    );
    return `https://wa.me/${this.WHATSAPP}?text=${msg}`;
  }

  whatsappGeneral(): string {
    const msg = encodeURIComponent('Bonjour, je souhaite obtenir plus d\'informations sur vos tarifs et réserver une séance. Merci !');
    return `https://wa.me/${this.WHATSAPP}?text=${msg}`;
  }
}
