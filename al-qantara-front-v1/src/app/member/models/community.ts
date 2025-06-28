// export interface Community {
//   id: number;
//   nom: string;
//   logo?: string;
//   description?: string;
//   createdBy: number;
//   createur: Utilisateur;
//   moderateurs: Utilisateur[];
//   membres: Utilisateur[];
//   membresbannis: Utilisateur[];
//   dateCreation: string;
//   posts: CommunityPost[];
// }

// export interface CommunityPost {
//   id: number;
//   titre: string;
//   contenu: string;
//   tags: string[];
//   modified: boolean;
//   auteurId: number;
//   auteur: Utilisateur;
//   communityId: number;
//   community: Community;
//   dateCreation: string;
//   likes: CommunityPostLike[];
//   commentaires: CommunityPostCommentaire[];
//   isPoll: boolean;
//   pollDeadline?: string;
//   pollOptions: PollOption[];
// }

// export interface PollOption {
//   id: number;
//   index: number;
//   label: string;
//   communityPost: CommunityPost;
//   communityPostId: number;
//   votes: PollVote[];
// }

// export interface PollVote {
//   id: number;
//   pollOption: PollOption;
//   pollOptionId: number;
//   utilisateur: Utilisateur;
//   utilisateurId: number;
// }

// export interface CommunityPostCommentaire {
//   id: number;
//   contenu: string;
//   modified: boolean;
//   auteurId: number;
//   auteur: Utilisateur;
//   postId: number;
//   post: CommunityPost;
//   dateCreation: string;
//   parentId?: number;
//   parent?: CommunityPostCommentaire;
//   replies: CommunityPostCommentaire[];
//   likes: CommunityPostCommentaireLike[];
// }

// export interface CommunityPostCommentaireLike {
//   id: number;
//   commentaireId: number;
//   utilisateurId: number;
//   dateLike: string;
//   commentaire: CommunityPostCommentaire;
//   utilisateur: Utilisateur;
// }

// export interface CommunityPostLike {
//   id: number;
//   postId: number;
//   utilisateurId: number;
//   dateLike: string;
//   post: CommunityPost;
//   utilisateur: Utilisateur;
// }