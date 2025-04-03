export class User{
  constructor(
    public nom: string,
    public prenom: string,
    public email: string,
    public password: string,
    public role: string = 'USER',

  ) {}

  // Méthode pour afficher les informations de l'utilisateur
  afficherInfos(): string {
    return `Nom: ${this.nom}, Prénom: ${this.prenom}, Email: ${this.email}, Role: ${this.role}`;
  }

}
