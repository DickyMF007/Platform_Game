const envBucket = process.env.NEXT_PUBLIC_REGISTRATION_PROOF_BUCKET;

export const registrationProofBucket =
  envBucket && envBucket.trim() ? envBucket.trim() : "registration-proof";
