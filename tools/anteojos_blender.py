"""Anteojos de Pausa Inquieta en Blender (wayfarer negro, cristales violeta, trama y logo).

Uso (desde la carpeta del proyecto):
    python tools/anteojos_texturas.py
    blender -b --python tools/anteojos_blender.py
Opcional, para revisar: agregar  -- --render  (deja capturas en assets/3d/anteojos/render-*.png)

Salidas en assets/3d/anteojos/: anteojos.blend (editable) y anteojos.glb (para la web).
Medidas en centímetros (el objeto raíz se escala a metros al exportar).
"""
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/3d/anteojos"
RENDER = "--render" in sys.argv

WRAP = 0.017        # curvatura horizontal del frente: z -= WRAP * x²
DEPTH = 0.7        # espesor del frente (cm)


def wrap_z(x):
    return -WRAP * x * x


# ---------------------------------------------------------------- utilidades
def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def rounded_polygon(pts, radii, seg=10):
    """Polígono con las esquinas redondeadas (lista de (x, y))."""
    out = []
    n = len(pts)
    for i in range(n):
        p0, p1, p2 = Vector(pts[i - 1]), Vector(pts[i]), Vector(pts[(i + 1) % n])
        r = radii[i]
        if r <= 0:
            out.append(tuple(pts[i]))
            continue
        a, b = (p0 - p1).normalized(), (p2 - p1).normalized()
        ang = math.acos(max(-1, min(1, a.dot(b))))
        t = r / math.tan(ang / 2)
        t = min(t, (p0 - p1).length * 0.48, (p2 - p1).length * 0.48)
        s, e = p1 + a * t, p1 + b * t
        # curva cuadrática por la esquina (suave y estable)
        for k in range(seg + 1):
            u = k / seg
            q = (1 - u) ** 2 * s + 2 * (1 - u) * u * p1 + u ** 2 * e
            out.append((q.x, q.y))
    return out


def mirror_x(pts):
    return [(-x, y) for x, y in pts]


def material(name, color, rough, metal=0.0, tex=None, transmission=0.0, ior=1.45, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["IOR"].default_value = ior
    bsdf.inputs["Transmission Weight"].default_value = transmission
    if tex:
        img = bpy.data.images.load(str(tex))
        node = m.node_tree.nodes.new("ShaderNodeTexImage")
        node.image = img
        m.node_tree.links.new(node.outputs["Color"], bsdf.inputs["Base Color"])
    return m


def srgb(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c)


def link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    return obj


def smooth(obj, angle=40):
    for p in obj.data.polygons:
        p.use_smooth = True
    # Blender 4.1+: suavizado por ángulo
    with bpy.context.temp_override(object=obj, selected_editable_objects=[obj], active_object=obj):
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
        except Exception:
            bpy.ops.object.shade_auto_smooth(angle=math.radians(angle))


def apply_mod(obj, kind, **props):
    m = obj.modifiers.new(kind.title(), kind)
    for k, v in props.items():
        setattr(m, k, v)
    with bpy.context.temp_override(object=obj, active_object=obj, selected_objects=[obj], selected_editable_objects=[obj]):
        bpy.ops.object.modifier_apply(modifier=m.name)


def curve_to_mesh(curve_obj):
    bpy.context.view_layer.objects.active = curve_obj
    for o in bpy.context.selected_objects:
        o.select_set(False)
    curve_obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return bpy.context.view_layer.objects.active


# ---------------------------------------------------------------- formas (cm)
# Cristal derecho del que mira (x > 0): trapecio wayfarer, arriba más ancho,
# la punta de afuera más alta, abajo redondeado.
LENS_R = rounded_polygon(
    [(1.0, 1.95), (6.25, 2.1), (5.85, -1.85), (1.95, -1.9)],
    [0.75, 0.95, 1.7, 1.45], seg=16)
LENS_L = mirror_x(LENS_R)[::-1]

# Contorno exterior del frente (mitad derecha, de arriba al centro hacia abajo al centro)
OUT_R = [
    (0.0, 2.55), (6.72, 2.65), (6.45, -1.95), (2.5, -2.32),
    (1.12, -1.05), (0.82, 0.55), (0.0, 0.75),
]
OUT_RAD = [0.0, 0.55, 1.75, 1.7, 1.0, 0.5, 0.0]


def outline():
    # rounded_polygon cierra el polígono; usamos la mitad derecha completa y la espejamos
    # (se arma como un único contorno: derecha de arriba hacia abajo, izquierda de abajo hacia arriba)
    r = rounded_polygon(OUT_R + mirror_x(OUT_R[::-1])[1:-1], OUT_RAD + OUT_RAD[::-1][1:-1], seg=14)
    return r


def curve_from_polys(name, polys, extrude, bevel, bevel_res=4):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = extrude
    cu.bevel_depth = bevel
    cu.bevel_resolution = bevel_res
    for poly in polys:
        sp = cu.splines.new("POLY")
        sp.points.add(len(poly) - 1)
        for i, (x, y) in enumerate(poly):
            sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    return link(bpy.data.objects.new(name, cu))


def planar_uv(obj, xmin, xmax, ymin, ymax):
    me = obj.data
    uv = me.uv_layers.new(name="UVMap") if not me.uv_layers else me.uv_layers[0]
    for poly in me.polygons:
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = ((v.x - xmin) / (xmax - xmin), (v.y - ymin) / (ymax - ymin))


def bend(obj, extra=0.0):
    for v in obj.data.vertices:
        v.co.z += wrap_z(v.co.x) + extra * v.co.x * v.co.x


# ---------------------------------------------------------------- patas (loft a mano)
def temple(name, side, mat_tex, length=14.6):
    """Pata: perfil rectangular redondeado que recorre un camino (recto y al final baja
    para la oreja). Ancha en la bisagra, se afina hacia atrás, punta redondeada.
    side = +1 (x positivo) o -1. UV: mitad de arriba = cara de afuera, abajo = adentro."""
    hx = side * 6.42
    hinge = Vector((hx, 1.85, wrap_z(6.42) - DEPTH - 0.04))
    # camino: (x, y, z) por tramos; z negativo = hacia atrás
    N = 90
    path = []
    for i in range(N + 1):
        s = i / N
        z = hinge.z - s * length * 0.86
        y = hinge.y + 0.12 * math.sin(s * math.pi)            # leve arco
        x = hinge.x + side * 0.25 * s                          # se abren apenas
        bendk = max(0.0, (s - 0.72) / 0.28)                    # curva de la oreja
        y -= 2.6 * bendk ** 1.6
        z -= 0.6 * bendk
        path.append(Vector((x, y, z)))
    # largo acumulado (para la U)
    acc = [0.0]
    for i in range(1, len(path)):
        acc.append(acc[-1] + (path[i] - path[i - 1]).length)
    L = acc[-1]

    def size(s):
        # medio alto y medio ancho; en la bisagra es ancha, se afina hacia atrás
        h = 0.7 * (1 - 0.5 * s ** 0.8)
        w = 0.27 * (1 - 0.35 * s)
        if s > 0.965:  # punta redondeada
            k = (s - 0.965) / 0.035
            f = math.sqrt(max(0.0, 1 - k * k))
            h, w = max(0.02, h * f), max(0.02, w * f)
        return h, w

    # perfil: rectángulo redondeado (M puntos), en coordenadas (px = lado, py = arriba)
    M = 36
    prof = []
    for j in range(M):
        t = j / M * 2 * math.pi
        c, sn = math.cos(t), math.sin(t)
        e = 0.55  # superelipse: casi rectangular con esquinas suaves
        px = math.copysign(abs(c) ** e, c)
        py = math.copysign(abs(sn) ** e, sn)
        prof.append((px, py))

    bm = bmesh.new()
    rings = []
    up_ref = Vector((0, 1, 0))
    for i, p in enumerate(path):
        s = acc[i] / L
        tng = (path[min(i + 1, N)] - path[max(i - 1, 0)]).normalized()
        sideV = tng.cross(up_ref).normalized() * -side if side > 0 else tng.cross(up_ref).normalized() * -side
        # que "afuera" apunte a ±x
        if sideV.x * side < 0:
            sideV = -sideV
        upV = sideV.cross(tng).normalized()
        if upV.y < 0:
            upV = -upV
        h, w = size(s)
        ring = [bm.verts.new(p + sideV * (px * w) + upV * (py * h)) for px, py in prof]
        rings.append((ring, s))
    bm.verts.ensure_lookup_table()
    uv_layer = bm.loops.layers.uv.new("UVMap")
    for i in range(len(rings) - 1):
        r0, s0 = rings[i]
        r1, s1 = rings[i + 1]
        for j in range(M):
            j2 = (j + 1) % M
            f = bm.faces.new((r0[j], r0[j2], r1[j2], r1[j]))
            # lado de la cara: afuera si px > 0 en promedio
            pxs = [prof[j][0], prof[j2][0]]
            outer = (pxs[0] + pxs[1]) > 0
            for loop in f.loops:
                vi = loop.vert
                # índice en el perfil y en el camino
                jj = j if vi in (r0[j], r1[j]) else j2
                ss = s0 if vi in r0 else s1
                py = prof[jj][1]
                # u: se lee de la bisagra hacia atrás en el logo (afuera +x / adentro -x)
                u = ss if (side > 0) == outer else 1 - ss
                vv = (py + 1) / 2
                v = 0.5 + 0.5 * vv if outer else 0.5 * vv
                loop[uv_layer].uv = (u, v)
    # tapa de adelante (contra la bisagra)
    bm.faces.new(rings[0][0][::-1])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = link(bpy.data.objects.new(name, me))
    obj.data.materials.append(mat_tex)
    smooth(obj, 60)
    return obj, hinge


# ---------------------------------------------------------------- bisagras metálicas
def hinge_parts(side, hinge, mat_metal, parent):
    parts = []
    # placa en el marco y placa en la pata, más el barril y dos tornillos (se ven desde adentro)
    def box(name, size, loc):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        o = bpy.context.active_object
        o.name = name
        o.scale = size
        bpy.ops.object.transform_apply(scale=True)
        bev = o.modifiers.new("Bisel", "BEVEL")
        bev.width = 0.03
        bev.segments = 3
        o.data.materials.append(mat_metal)
        parts.append(o)
        return o

    x_in = hinge.x - side * 0.27
    box(f"Bisagra placa marco {side}", (0.06, 0.7, 0.55), (x_in, hinge.y, hinge.z + 0.3))
    box(f"Bisagra placa pata {side}", (0.06, 0.62, 0.9), (x_in, hinge.y, hinge.z - 0.55))
    bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.75, vertices=24, location=(x_in - side * 0.05, hinge.y, hinge.z - 0.05))
    barrel = bpy.context.active_object
    barrel.rotation_euler = (math.pi / 2, 0, 0)  # el eje de la bisagra, vertical
    barrel.name = f"Bisagra barril {side}"
    barrel.data.materials.append(mat_metal)
    parts.append(barrel)
    for k, dz in enumerate((0.25, -0.75)):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.05, vertices=20, location=(x_in - side * 0.04, hinge.y, hinge.z + dz))
        sc = bpy.context.active_object
        sc.rotation_euler = (0, math.pi / 2, 0)
        sc.name = f"Tornillo {side}-{k}"
        sc.data.materials.append(mat_metal)
        parts.append(sc)
    for o in parts:
        smooth(o, 35)
        o.parent = parent
    return parts


# ---------------------------------------------------------------- armado
def build():
    clear()
    root = link(bpy.data.objects.new("Anteojos Pausa Inquieta", None))

    m_frame = material("Marco", srgb("#101010"), 0.42, tex=OUT / "marco.png")
    m_frame_plain = material("Marco liso", srgb("#101010"), 0.42)
    m_lens = material("Cristal", srgb("#603879"), 0.08, transmission=0.4, ior=1.45)
    m_metal = material("Metal", srgb("#c9c9cc"), 0.28, metal=1.0)
    m_pata_izq = material("Pata izquierda", srgb("#101010"), 0.42, tex=OUT / "pata-izq.png")
    m_pata_der = material("Pata derecha", srgb("#101010"), 0.42, tex=OUT / "pata-der.png")

    # Frente: contorno con los dos huecos, con espesor y bisel
    out = outline()
    frame = curve_from_polys("Frente", [out, LENS_R, LENS_L], extrude=DEPTH / 2 - 0.24, bevel=0.24, bevel_res=6)
    frame = curve_to_mesh(frame)
    frame.name = "Frente"
    # el frente queda entre z = 0 (adelante) y z = -DEPTH
    for v in frame.data.vertices:
        v.co.z -= DEPTH / 2
    # superficie fina y pareja (remesh) para poder modelar el frente como plástico inyectado
    apply_mod(frame, "REMESH", mode="VOXEL", voxel_size=0.035, use_smooth_shade=True)
    apply_mod(frame, "SMOOTH", factor=0.6, iterations=6)
    # la ceja se adelanta (wayfarer) y el frente es apenas convexo
    for v in frame.data.vertices:
        f = max(0.0, min(1.0, (v.co.z + DEPTH / 2) / (DEPTH / 2)))  # 1 = cara de adelante
        y = v.co.y
        brow = max(0.0, min(1.0, (y - 1.1) / 1.35))
        brow = brow * brow * (3 - 2 * brow)
        v.co.z += f * (0.26 * brow + 0.1 * max(0.0, 1 - (y / 2.4) ** 2))
    apply_mod(frame, "DECIMATE", ratio=0.22)
    xs = [p[0] for p in out]
    ys = [p[1] for p in out]
    planar_uv(frame, min(xs) - 0.15, max(xs) + 0.15, min(ys) - 0.15, max(ys) + 0.15)
    bend(frame)
    frame.data.materials.append(m_frame)
    smooth(frame, 50)
    frame.parent = root

    # Cristales: con espesor, un poco más grandes que el hueco (quedan metidos en el marco)
    def grow(poly, d):
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        return [(cx + (x - cx) * (1 + d / 2.6), cy + (y - cy) * (1 + d / 1.8)) for x, y in poly]

    for nm, poly in (("Cristal derecho", LENS_R), ("Cristal izquierdo", LENS_L)):
        c = curve_from_polys(nm, [grow(poly, 0.12)], extrude=0.09, bevel=0.0)
        c = curve_to_mesh(c)
        c.name = nm
        for v in c.data.vertices:
            v.co.z -= DEPTH * 0.32
        # leve curvatura propia del cristal
        cx = sum(p[0] for p in poly) / len(poly)
        for v in c.data.vertices:
            v.co.z += -0.035 * ((v.co.x - cx) ** 2 + (v.co.y * 0.8) ** 2) * 0.4
        bend(c)
        planar_uv(c, -7.5, 7.5, -2.5, 2.5)
        c.data.materials.append(m_lens)
        smooth(c, 80)
        c.parent = root

    # Patas y bisagras
    for side, mat in ((1, m_pata_izq), (-1, m_pata_der)):
        t, hinge = temple(f"Pata {'izquierda' if side > 0 else 'derecha'}", side, mat)
        t.parent = root
        hinge_parts(side, hinge, m_metal, root)

    # cm → m, y del sistema del modelo (y arriba, z adelante) al de Blender (z arriba)
    root.scale = (0.01, 0.01, 0.01)
    root.rotation_euler = (math.pi / 2, 0, 0)
    return root


def B(p):
    """punto del sistema del modelo (y arriba, z adelante) al de Blender (z arriba, -y adelante)"""
    x, y, z = p
    return Vector((x, -z, y))


def lights_and_camera():
    scn = bpy.context.scene
    scn.render.engine = "CYCLES"
    scn.cycles.samples = 64
    scn.cycles.device = "CPU"
    scn.render.resolution_x, scn.render.resolution_y = 1200, 800
    scn.render.film_transparent = False
    world = bpy.data.worlds.new("Estudio")
    scn.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.02, 0.02, 0.022, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
    for name, loc, energy, size in (("Key", (0.55, 0.45, 0.35), 30, 0.5), ("Rim", (-0.5, 0.35, -0.4), 35, 0.5), ("Fill", (-0.5, 0.05, 0.45), 8, 1.0), ("Top", (0.0, 0.7, 0.0), 20, 1.0)):
        l = bpy.data.lights.new(name, "AREA")
        l.energy = energy
        l.size = size
        o = link(bpy.data.objects.new(name, l))
        o.location = B(loc)
        d = Vector((0, 0, 0)) - B(loc)
        o.rotation_euler = d.to_track_quat("-Z", "Z").to_euler()
    cam = bpy.data.cameras.new("Cam")
    cam.lens = 70
    co = link(bpy.data.objects.new("Cam", cam))
    scn.camera = co
    return co


def shoot(co, loc, target, path):
    co.location = B(loc)
    d = B(target) - B(loc)
    co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "anteojos.blend"))
    bpy.ops.export_scene.gltf(
        filepath=str(OUT / "anteojos.glb"), export_format="GLB",
        export_apply=True, export_image_format="JPEG", export_jpeg_quality=90,
        export_yup=True,
    )
    print("OK: anteojos.blend + anteojos.glb")
    if RENDER:
        co = lights_and_camera()
        # Blender es Z arriba: en el modelo "arriba" es y → al exportar con Y-up queda bien;
        # acá el modelo está en coordenadas propias (y arriba, z hacia adelante), así que
        # la cámara se ubica en ese mismo sistema.
        tgt = (0, 0.0, -0.05)
        shoot(co, (0.38, 0.06, 0.26), tgt, OUT / "render-frente.png")     # como la imagen 2
        shoot(co, (-0.3, 0.16, -0.38), tgt, OUT / "render-atras.png")     # como la imagen 3
        shoot(co, (0.0, 0.0, 0.5), tgt, OUT / "render-de-frente.png")
        shoot(co, (0.5, 0.02, -0.05), tgt, OUT / "render-costado.png")
        print("OK: renders")
