import { createSign, createHash } from 'node:crypto';

const MAGIC = Buffer.from('Cr24');
const VERSION = 3;
const SIGNATURE_CONTEXT = Buffer.from('CRX3 SignedData\0');

function varint(value: number): Buffer {
  const bytes: number[] = [];
  let remaining = value;
  while (remaining > 0x7f) {
    bytes.push((remaining & 0x7f) | 0x80);
    remaining >>>= 7;
  }
  bytes.push(remaining);
  return Buffer.from(bytes);
}

function field(fieldNumber: number, payload: Buffer): Buffer {
  const tag = varint((fieldNumber << 3) | 2);
  return Buffer.concat([tag, varint(payload.length), payload]);
}

function uint32LE(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

export function packCrx(zip: Buffer, publicKeyDer: Buffer, privateKeyPem: string): Buffer {
  const crxId = createHash('sha256').update(publicKeyDer).digest().subarray(0, 16);
  const signedHeaderData = field(1, crxId);

  const signer = createSign('sha256');
  signer.update(SIGNATURE_CONTEXT);
  signer.update(uint32LE(signedHeaderData.length));
  signer.update(signedHeaderData);
  signer.update(zip);
  const signature = signer.sign(privateKeyPem);

  const keyProof = Buffer.concat([field(1, publicKeyDer), field(2, signature)]);
  const header = Buffer.concat([field(2, keyProof), field(10000, signedHeaderData)]);

  return Buffer.concat([MAGIC, uint32LE(VERSION), uint32LE(header.length), header, zip]);
}
