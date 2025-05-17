export class Event {
    constructor(
        public id: number,
        public titre: string,
        public description: string,
        public image: string,
        public nombrePlaces: number,
        public tags: string[],
        public dateDebut: Date,
        public dateFin: Date,
        public lieu: string,
        public datePublication: Date,
        public createdBy:number
    ) {
    }
}
