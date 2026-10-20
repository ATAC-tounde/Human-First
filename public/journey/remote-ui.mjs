/**
 * JOURNEY V1.2: deliberately opt-in remote encrypted backup controls.
 * Remote transport sees a random bearer capability and encrypted bytes only.
 * This adapter never sends or saves the independent encryption passphrase.
 */
import {encryptPortfolio,decryptPortfolio} from './vault.mjs';
import {generateSyncKey,remoteSyncConfig,readRemoteBackup,writeRemoteBackup,deleteRemoteBackup} from './sync-client.mjs';
const content={
 fr:{
  eyebrow:'V1.2 · SYNCHRONISATION CHIFFRÉE FACULTATIVE',heading:'Une copie distante, sous ton contrôle.',
  intro:'Pilote expérimental : seule une sauvegarde chiffrée est envoyée au serveur. Aucun compte ni synchronisation automatique.',
  warning:'Le code de jumelage donne accès à ta copie chiffrée et permet de l’effacer. Ne le partage pas. La phrase secrète de chiffrement est indépendante. Perdre l’un des deux peut empêcher la récupération.',
  label:'Code de jumelage privé (32 octets aléatoires)',generate:'Créer un nouveau code',reveal:'Afficher / masquer le code',
  upload:'Envoyer une copie chiffrée',download:'Télécharger la copie distante',restore:'Restaurer ma copie distante',delete:'Effacer la copie distante',
  note:'HUMAN FIRST ne conserve pas le code de jumelage. Nécessite un serveur Node durable en HTTPS, désactivé par défaut, notamment sur Vercel.',
  checking:'Vérification du serveur…',disabled:'Service désactivé. Tes sauvegardes locales restent disponibles.',enabled:'Pilote disponible. Aucune action n’est automatique.',
  needsKey:'Saisis le code de jumelage complet (48 caractères).',created:'Code créé : conserve-le en lieu sûr avant de quitter cet onglet.',
  missing:'Aucune sauvegarde pour ce code.',mustCreate:'Crée ou importe un parcours avant de le sauvegarder.',
  mismatch:'Les phrases secrètes ne correspondent pas.',overwrite:'Une copie distante existe. Télécharge d’abord une copie de secours avant de la remplacer. Continuer ?',
  deleteConfirm:'Effacer définitivement la copie distante ? Le serveur ne pourra pas la récupérer.',
  uploaded:'Sauvegarde chiffrée envoyée. Conserve une copie locale et ton code.',downloaded:'Copie distante téléchargée sans déchiffrement.',
  restored:'Copie distante restaurée ; aucun texte lisible n’a été envoyé.',deleted:'Copie distante effacée.',
  failed:'Opération refusée : ',busy:'Opération sécurisée en cours…',
  replaceKey:'Changer de code ? Les copies associées à l’ancien code ne seront plus accessibles sans lui.'
 },en:{
  eyebrow:'V1.2 · OPTIONAL ENCRYPTED SYNC',heading:'A remote copy under your control.',
  intro:'Experimental pilot: only an encrypted backup reaches the server. No account or automatic synchronization.',
  warning:'Your pairing code grants access to the ciphertext and permits deletion. Never share it. Your encryption passphrase is separate. Losing either can prevent recovery.',
  label:'Private pairing code (32 random bytes)',generate:'Create a new code',reveal:'Show / hide code',
  upload:'Send encrypted backup',download:'Download remote backup',restore:'Restore remote backup',delete:'Delete remote backup',
  note:'HUMAN FIRST does not save your pairing code. Requires a durable HTTPS Node server, disabled by default including on Vercel.',
  checking:'Checking the server…',disabled:'Service disabled. Your local backups are still available.',enabled:'Pilot available. Nothing is automatic.',
  needsKey:'Enter a complete 48-character pairing code.',created:'Code generated: keep it safe before closing this tab.',
  missing:'No backup exists for this code.',mustCreate:'Create or import a pathway before saving it.',
  mismatch:'Passphrases do not match.',overwrite:'A remote backup exists. Download a safety copy before replacing it. Continue?',
  deleteConfirm:'Permanently delete the remote backup? The server cannot recover it.',
  uploaded:'Encrypted backup sent. Keep a local copy and your code.',downloaded:'Remote encrypted backup downloaded.',
  restored:'Remote backup restored; no readable content was transmitted.',deleted:'Remote backup deleted.',
  failed:'Operation refused: ',busy:'Secure operation in progress…',
  replaceKey:'Change the code? Backups associated with the old code will not be accessible without it.'
 }
};
const fields={
 'remote-sync-eyebrow':'eyebrow','remote-sync-heading':'heading','remote-sync-intro':'intro',
 'remote-sync-warning':'warning','remote-sync-key-label':'label',
 'remote-sync-generate':'generate','remote-sync-reveal':'reveal',
 'remote-sync-upload':'upload','remote-sync-download':'download',
 'remote-sync-restore':'restore','remote-sync-delete':'delete','remote-sync-note':'note'
};
const controls=['remote-sync-generate','remote-sync-reveal','remote-sync-upload',
 'remote-sync-download','remote-sync-restore','remote-sync-delete'];
export function mountEncryptedRemoteSync({
 root=globalThis.document,lang=()=> 'fr',busy=()=>false,
 createPlaintext,restorePlaintext,getPassphrase,getConfirmation,clearPassphrases,
 downloadCipher,confirm=message=>globalThis.confirm(message)
}){
 const $=id=>root.getElementById(id);
 let enabled=false,locked=false,initialized=false;
 const words=()=>content[lang()==='en'?'en':'fr'];
 const status=message=>{$('remote-sync-status').textContent=message;};
 const lockControls=()=>{for(const id of controls)$(id).disabled=!enabled||locked;};
 function render(){
  const w=words();
  for(const [id,key] of Object.entries(fields))$(id).textContent=w[key];
  $('remote-sync-availability').textContent=initialized?(enabled?w.enabled:w.disabled):w.checking;
  lockControls();
 }
 const key=()=>{
  const value=$('remote-sync-key').value.trim();
  if(!/^hfs1_[A-Za-z0-9_-]{43}$/.test(value))throw new TypeError(words().needsKey);
  return value;
 };
 async function run(action){
  if(!enabled||locked||busy())return;
  locked=true;lockControls();status(words().busy);
  try{
   const w=words(),token=key();
   if(action==='upload'){
    const plain=createPlaintext();
    if(!plain)throw new Error(w.mustCreate);
    const pass=getPassphrase();
    if(pass!==getConfirmation())throw new Error(w.mismatch);
    const previous=await readRemoteBackup(token);
    if(previous.exists&&!confirm(w.overwrite)){status('');return;}
    const cipher=await encryptPortfolio(plain,pass);
    await writeRemoteBackup(token,cipher,previous.revision);
    status(w.uploaded);
   }else if(action==='delete'){
    const old=await readRemoteBackup(token);
    if(!old.exists)throw new Error(w.missing);
    if(!confirm(w.deleteConfirm)){status('');return;}
    await deleteRemoteBackup(token,old.revision);
    status(w.deleted);
   }else{
    const old=await readRemoteBackup(token);
    if(!old.exists)throw new Error(w.missing);
    if(action==='download'){
     downloadCipher(old.content);status(w.downloaded);
    }else{
     const plain=await decryptPortfolio(old.content,getPassphrase());
     status(restorePlaintext(plain)===false?'':w.restored);
    }
   }
  }catch(error){status(words().failed+String(error.message||error));}
  finally{
   clearPassphrases();locked=false;lockControls();
  }
 }
 $('remote-sync-generate').addEventListener('click',()=>{
  if(!enabled||locked)return;
  const input=$('remote-sync-key');
  if(input.value&&!confirm(words().replaceKey))return;
  input.value=generateSyncKey();input.type='text';
  status(words().created);input.focus();input.select();
 });
 $('remote-sync-reveal').addEventListener('click',()=>{
  const input=$('remote-sync-key');
  input.type=input.type==='password'?'text':'password';
 });
 for(const [id,action] of [
  ['remote-sync-upload','upload'],['remote-sync-download','download'],
  ['remote-sync-restore','restore'],['remote-sync-delete','delete']]){
  $(id).addEventListener('click',()=>run(action));
 }
 render();
 return {
  render,
  async initialize(){
   try{enabled=(await remoteSyncConfig()).enabled;}
   catch{enabled=false;}
   initialized=true;render();
  }
 };
}
