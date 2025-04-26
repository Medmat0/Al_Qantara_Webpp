export class Revue{
    constructor(
        public id: number,
        public titre: string,
        public description: string,
        public mois: string,
        public annee: string,
        public fichier: string ,
        public datePublication: string,
        public nombreVues: number,
        public nombreTelechargements: number,
        public createdBy:number


    ) {
    }

}
