import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Service pour détecter les événements terminés et envoyer des rappels de rating
 */

/**
 * Obtenir les événements terminés qui nécessitent des rappels de rating
 * @returns {Promise<Array>} List of events that need rating reminders
 */
export const getFinishedEventsNeedingRatings = async () => {
  try {
    const now = new Date();
    
    // Obtenir les événements terminés dans les dernières 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const finishedEvents = await prisma.evenement.findMany({
      where: {
        dateFin: {
          lt: now, // Événement terminé
          gte: fiveMinutesAgo // Terminé il y a moins de 5 minutes
        }
      },
      include: {
        participations: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        ratings: {
          select: {
            utilisateurId: true
          }
        },
        createur: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    const eventsNeedingRatings = finishedEvents.filter(event => {
      const usersWhoRated = event.ratings.map(rating => rating.utilisateurId);
      
      const participantsWhoNeedToRate = event.participations.filter(
        participation => !usersWhoRated.includes(participation.utilisateurId)
      );
      
      return participantsWhoNeedToRate.length > 0;
    });

    return eventsNeedingRatings;
  } catch (error) {
    console.error("Erreur lors de la récupération des événements nécessitant des ratings:", error);
    throw error;
  }
};

/**
 * Envoyer un email de rappel de rating à un participant
 * @param {Object} participant - Participant object with user info
 * @param {Object} event - Event object
 */
export const sendRatingReminderEmail = async (participant, event) => {
  try {
    const emailInfo = {
      to: participant.utilisateur.email,
      subject: `Votre avis nous intéresse - ${event.titre}`,
      html: generateRatingReminderHTML(participant.utilisateur, event)
    };

    await sendEmailToUser(emailInfo);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email de rappel à ${participant.utilisateur.email}:`, error);
    throw error;
  }
};

/**
 * Générer le contenu HTML de l'email de rappel de rating
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @returns {string} HTML content for the email
 */
export const generateRatingReminderHTML = (user, event) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donnez votre avis sur l'événement</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #ea6666ff 0%, #a24e4bff 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
                color: #555;
            }
            .event-info {
                background-color: #f8f9fa;
                border-left: 4px solid #ea6666ff;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .event-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin-bottom: 10px;
            }
            .event-details {
                color: #666;
                font-size: 14px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #ea6666ff 0%, #a24b4bff 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
                transition: transform 0.3s ease;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #e9ecef;
            }
            .rating-importance {
                background-color: #e8f4fd;
                border: 1px solid #bee5eb;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
            }
            .rating-importance h3 {
                color: #60570cff;
                margin-top: 0;
                font-size: 16px;
            }
            .rating-importance p {
                color: #60290cff;
                margin-bottom: 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1> Votre Avis Nous Intéresse</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Bonjour ${user.prenom} ${user.nom},
                </div>
                
                <p>Nous espérons que vous avez passé un excellent moment lors de notre récent événement !</p>
                
                <div class="event-info">
                    <div class="event-title">${event.titre}</div>
                    <div class="event-details">
                        📅 ${formatDate(event.dateDebut)}${event.dateDebut !== event.dateFin ? ' - ' + formatDate(event.dateFin) : ''}<br>
                        📍 ${event.lieu}<br>
                    </div>
                </div>
                
                <div class="rating-importance">
                    <h3>Pourquoi votre avis est important ?</h3>
                    <p>Votre feedback nous aide à améliorer nos événements futurs et permet aux autres membres de la communauté de faire des choix éclairés. Quelques minutes suffisent pour faire la différence !</p>
                </div>
                
                <p>Pourriez-vous prendre quelques instants pour évaluer cet événement ? Votre avis constructif nous est précieux.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/events/${event.id}?action=rate" class="cta-button">
                        ⭐ Laisser mon avis
                    </a>
                </div>
                
                
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    Merci d'avance pour votre participation et à très bientôt pour de nouveaux événements !
                </p>
            </div>
            
            <div class="footer">
                <p>Al Qantara - Association culturelle<br>
                Cet email a été envoyé automatiquement. Si vous ne souhaitez plus recevoir ces rappels, contactez-nous.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Traiter tous les événements nécessitant des rappels de rating
 */
export const processRatingReminders = async () => {
  try {
    
    const eventsNeedingRatings = await getFinishedEventsNeedingRatings();
    
    
    if (eventsNeedingRatings.length === 0) {
      return {
        eventsProcessed: 0,
        emailsSent: 0
      };
    }
    
    
    let totalEmailsSent = 0;
    
    for (const event of eventsNeedingRatings) {
      // Obtenir les participants qui n'ont pas encore noté
      const usersWhoRated = event.ratings.map(rating => rating.utilisateurId);
      const participantsWhoNeedToRate = event.participations.filter(
        participation => !usersWhoRated.includes(participation.utilisateurId)
      );
      
      
      // Envoyer un email à chaque participant qui n'a pas encore noté
      for (const participant of participantsWhoNeedToRate) {
        try {
          await sendRatingReminderEmail(participant, event);
          totalEmailsSent++;
          
          // Délai entre les emails pour éviter de surcharger le serveur SMTP
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`❌ Erreur lors de l'envoi de l'email de rappel à ${participant.utilisateur.email}:`, error);
        }
      }
    }
    
    
    return {
      eventsProcessed: eventsNeedingRatings.length,
      emailsSent: totalEmailsSent
    };
  } catch (error) {
    console.error('❌ Erreur lors du traitement des rappels de rating:', error);
    throw error;
  }
};
