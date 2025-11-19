// components/Room.tsx
import { useGLTF } from "@react-three/drei"

export default function Room(props: {scale: number,position:[number,number,number],rotation:[number,number,number]}) {
  const { scene } = useGLTF("https://wayizhojrtgepgaihluv.supabase.co/storage/v1/object/public/my-models/abandoned_brick_room.glb") // đổi tên file của bạn
  return (
    <primitive object={scene} {...props} />
  )
}
