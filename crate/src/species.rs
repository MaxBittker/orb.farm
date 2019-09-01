use super::utils::*;
use Cell;

// use Light;
use SandApi;
use EMPTY_CELL;
use WASTE;

use std::cmp;
// use std::mem;
use wasm_bindgen::prelude::*;
// use web_sys::console;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Species {
    Air = 0,
    Glass = 1,
    Sand = 2,
    Water = 3,

    Algae = 4,
    Plant = 5,

    Zoop = 6,
    Egg = 14,
    Fish = 7,
    FishTail = 15,

    Bacteria = 8,
    Nitrogen = 9,

    Waste = 10,
    Seed = 11,
    Stone = 12,
    Wood = 13,
}

impl Species {
    pub fn update(&self, cell: Cell, api: SandApi) {
        match self {
            Species::Air => {}
            Species::Glass => {}

            Species::Water => update_water(cell, api),
            Species::Sand => update_sand(cell, api),
            Species::Stone => update_stone(cell, api),
            Species::Wood => {}

            Species::Bacteria => update_bacteria(cell, api),
            Species::Zoop => update_zoop(cell, api),
            Species::Egg => update_egg(cell, api),
            Species::Waste => update_waste(cell, api),
            Species::Nitrogen => update_nitrogen(cell, api),
            Species::Algae => update_algae(cell, api),

            Species::Fish => update_Fish(cell, api),
            Species::FishTail => update_Fishtail(cell, api),
            Species::Plant => update_plant(cell, api),
            Species::Seed => update_seed(cell, api),
        }
    }
    pub fn blocked_light(&self) -> u8 {
        match self {
            Species::Water => 1,
            Species::Fish => 25,
            Species::FishTail => 25,

            Species::Plant => 50,
            Species::Seed => 35,

            Species::Algae => 30,
            Species::Bacteria => 10,
            Species::Waste => 10,
            Species::Nitrogen => 10,
            Species::Zoop => 10,
            Species::Egg => 5,

            Species::Air => 0,
            Species::Glass => 0,

            Species::Stone => 100,
            Species::Wood => 100,
            Species::Sand => 100,
        }
    }
}

pub fn update_waste(cell: Cell, mut api: SandApi) {
    let dx = rand_dir_2();

    let nbr = api.get(0, 1);
    let dnbr = api.get(dx, 1);
    if nbr.species == Species::Air || nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
    }
}
pub fn update_Fishtail(cell: Cell, mut api: SandApi) {
    let age = cell.age;
    if (age == 0) {
        api.set(0, 0, Cell::new(Species::Water));

        let energy = cell.energy;
        let species = if energy == 2 {
            //dead
            Species::Waste
        } else {
            Species::FishTail
        };
        if energy == 1 {
            //fin
            let finCell = Cell {
                species,
                energy: 0,
                age: 0,
                ..cell
            };
            api.set(0, 0, finCell);

            if api.get(0, 1).species == Species::Water {
                api.set(0, 1, finCell);
            }
            if api.get(0, -1).species == Species::Water {
                api.set(0, -1, finCell);
            }
        }
    } else {
        api.set(
            0,
            0,
            Cell {
                age: age - 1,
                ..cell
            },
        );
    }
}

pub fn update_nitrogen(cell: Cell, mut api: SandApi) {
    let dx = rand_dir_2();

    let nbr = api.get(0, 1);

    if nbr.species == Species::Sand || nbr.species == Species::Plant {
        api.set(0, 0, Cell::new(Species::Water));
        api.set(
            0,
            1,
            Cell {
                energy: nbr.energy.saturating_add(200),
                ..nbr
            },
        );
        return;
    }
    let dnbr = api.get(dx, 1);
    if nbr.species == Species::Air || nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
    } else if nbr.species == Species::Waste {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    }
}

pub fn update_bacteria(cell: Cell, mut api: SandApi) {
    if rand_int(7) < 6 {
        return;
    }
    let energy = cell.energy;
    let (dx, dy) = rand_vec_8();

    let down = api.get(0, 1);
    let nbr = api.get(dx, 1);
    // if cell.age > 250 {
    //     api.set(0, 0, Cell::new(Species::Nitrogen));
    //     return;
    // }

    let sample = api.get(dx, dy);

    if sample.species == Species::Waste || (energy < 20 && sample.species == Species::Bacteria) {
        let mut new_energy = energy / 2;
        if energy < 250 {
            api.set(0, 0, WATER);
            new_energy = energy;
        } else {
            api.set(0, 0, Cell::new(Species::Nitrogen));
        }
        api.set(
            dx,
            dy,
            Cell {
                energy: new_energy.saturating_add(50),
                ..cell
            },
        );
        api.use_oxygen();
        api.use_oxygen();
        api.use_oxygen();
        api.use_oxygen();

        return;
    }

    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
        return;
    } else if nbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dx, 1, cell);
        return;
    }

    let (rdx, rdy) = adjacency_right((dx, dy));
    let (ldx, ldy) = adjacency_left((dx, dy));
    let r_sample = api.get(rdx, rdy).species;
    let l_sample = api.get(ldx, ldy).species;

    if sample.species == Species::Water
        && (r_sample != Species::Water || l_sample != Species::Water)
    {
        api.set(0, 0, sample);
        api.set(dx, dy, cell);
        return;
    }
    if nbr.species == Species::Water {
        api.set(0, 0, nbr);
        api.set(dx, 1, cell);
        return;
    }
    api.use_oxygen();

    api.set(
        0,
        0,
        Cell {
            energy: energy.saturating_sub(api.universe.generation % 2),
            ..cell
        },
    )
}

pub fn update_sand(cell: Cell, mut api: SandApi) {
    let mut age = cell.age;
    if cell.age == 0 {
        age = rand_int(255) as u8;
    }

    let (dx, dy) = rand_vec_8();

    let down = api.get(0, 1);
    let dnbr = api.get(dx, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
        return;
    } else if dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx, 1, cell);
        return;
    } else if dnbr.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(dx, 1, cell);
        return;
    }
    let energy = cell.energy;

    let nbr = api.get(dx, dy);

    if rand_int(8) == 1 && nbr.species == Species::Sand {
        //diffuse nutrients

        let shared_energy = (energy / 2) + (nbr.energy / 2);

        //higher is faster
        let diffusion_factor = 0.5;

        let new_energy = (energy / 2).saturating_add(shared_energy / 2) as u8;
        let new_nbr_energy = (nbr.energy / 2).saturating_add(shared_energy / 2) as u8;

        let conservation = (nbr.energy + energy) - (new_nbr_energy + new_energy);

        api.set(
            dx,
            dy,
            Cell {
                energy: new_nbr_energy.saturating_add(conservation),
                ..nbr
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: new_energy,
                age,
                ..cell
            },
        );
    }

    // let dx = rand_dir_2();

    // let nbr = api.get(0, 1);
    // let dnbr = api.get(dx, 1);
    // if nbr.species == Species::Air || nbr.species == Species::Water {
    //     api.set(0, 0, nbr);
    //     api.set(0, 1, cell);
    // } else if dnbr.species == Species::Air || dnbr.species == Species::Water {
    //     api.set(0, 0, dnbr);
    //     api.set(dx, 1, cell);
    // }
}
pub fn update_water(cell: Cell, mut api: SandApi) {
    let dx = rand_dir();
    let below = api.get(0, 1);
    let dx1 = api.get(dx, 1);
    let dx1r = api.get(-dx, 1);
    let dx0 = api.get(dx, 0);
    let dx0r = api.get(-dx, 0);
    if below.species == Species::Air {
        api.set(0, 0, below);
        api.set(0, 1, cell);
    } else if dx0.species == Species::Air {
        api.set(0, 0, dx0);
        api.set(dx, 0, cell);
    } else if dx0r.species == Species::Air {
        api.set(0, 0, dx0r);
        api.set(-dx, 0, cell);
    } else if dx1.species == Species::Air {
        api.set(0, 0, dx1);
        api.set(dx, 1, cell);
    } else if dx1r.species == Species::Air {
        api.set(0, 0, dx1r);
        api.set(-dx, 1, cell);
    }
}

pub fn update_algae(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let (mut dx, mut dy) = rand_vec_8();
    if rand_int(20) < 19 {
        return;
    }
    if cell.age > 200 {
        //old age
        api.set(0, 0, Cell::new(Species::Waste));
        return;
    }
    let nbr = api.get(dx, dy);
    let mut split_energy = 0;

    if nbr.species != Species::Water && nbr.species != Species::Algae {
        dx = 0;
        dy = 0;
    } else {
        if cell.age > 10 && cell.energy > 220 && api.get(-dx, -dy).species == Species::Water {
            split_energy = cell.energy / 2;
            api.set(
                0,
                0,
                Cell {
                    energy: split_energy.saturating_sub(100), //cost of reproduction
                    age: 0,
                    ..cell
                },
            );
        }
    }

    if split_energy == 0 {
        api.set(0, 0, nbr);
    }
    let mut photosynth: u8 = api.get_light().sun / 7;
    if photosynth > 0 && !api.use_co2() {
        photosynth = 0; //need co2
    }

    api.set(
        dx,
        dy,
        Cell {
            energy: cell
                .energy
                .saturating_add(photosynth)
                .saturating_sub(3) //cost of life
                .saturating_sub(split_energy),
            age: cell.age.saturating_add(api.universe.generation),
            ..cell
        },
    );
}
const zoop_padding: u8 = 14;
const glide_length: u8 = 8;

pub fn update_zoop(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);

    if down.species == Species::Air {
        api.set(0, 0, down);
        api.set(0, 1, cell);
        return;
    }
    let age = cell.age;
    let energy = cell.energy;
    let (sx, sy) = rand_vec_8();
    let sample = api.get(sx, sy);
    api.use_oxygen();
    if sample.species == Species::Algae || sample.species == Species::Egg {
        api.set(
            0,
            0,
            Cell {
                energy: energy.saturating_add(40 + sample.energy / 2),
                ..cell
            },
        );
        api.set(sx, sy, Cell::new(Species::Water));

        if energy > 230 && api.use_oxygen() {
            let new_energy = energy / 4;
            api.set(
                sx,
                sy,
                Cell {
                    species: Species::Egg,
                    energy: new_energy * 3,
                    age: 0,
                    ..cell
                },
            );

            api.set(
                0,
                0,
                Cell {
                    energy: new_energy,
                    ..cell
                },
            );
        }
        return;
    }

    if energy == 0 {
        api.set(0, 0, WASTE);
        return;
    }

    if age < zoop_padding || energy < 20 {
        //sinking
        let dx = rand_dir();
        let dy = rand_int(2);
        let down = api.get(dx, dy);
        if (down.species == Species::Water) && rand_int(5) == 0 {
            api.set(0, 0, down);
            api.set(
                dx,
                dy,
                Cell {
                    age: age + rand_int(2) as u8,
                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    age: age + rand_int(2) as u8,
                    energy: energy.saturating_sub(cell.clock),

                    ..cell
                },
            );
        }
    } else if age == zoop_padding {
        // kick
        let (mut dx, mut dy) = if api.get_light().sun < 200 {
            rand_vec_up_3() // seek light
        } else {
            rand_vec_8() //wander
        }; // pointed up
        let nbr = api.get(dx, dy);
        if nbr.species != Species::Water {
            dx *= -1;
            dy *= -1;
        }
        if api.use_oxygen() {
            api.set(
                0,
                0,
                Cell {
                    age: zoop_padding + join_dy_dx(dx, dy, 0),
                    energy: energy.saturating_sub(1),

                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    energy: energy.saturating_sub(1),
                    ..cell
                },
            );
        }
    } else {
        //gliding
        let (dx, dy, rem) = split_dy_dx(cell.age - zoop_padding);
        if rem > glide_length {
            api.set(0, 0, Cell { age: 0, ..cell });
            return;
        }
        let nbr = api.get(dx, dy);
        //   api.use_oxygen()
        if nbr.species == Species::Water && (api.use_oxygen()) {
            api.set(0, 0, nbr);
            // api.set(0, dy, Cell::new(clone_species));

            let (ndx, ndy) = match rand_int(100) % 50 {
                0 => adjacency_left((dx, dy)),
                1 => adjacency_right((dx, dy)),
                _ => (dx, dy),
            };
            api.set(
                dx,
                dy,
                Cell {
                    age: zoop_padding + join_dy_dx(ndx, ndy, rem + 1),
                    // energy: energy.saturating_sub(cell.clock),
                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    age: zoop_padding + join_dy_dx(dx, dy, glide_length + 1),
                    energy: energy.saturating_sub(cell.clock),
                    ..cell
                },
            );
        }
    }
}

pub fn update_egg(cell: Cell, mut api: SandApi) {
    let dx = rand_dir();
    if cell.age > 250 && api.use_oxygen() {
        // hatch
        api.set(
            0,
            0,
            Cell {
                species: Species::Zoop,
                age: 0,
                energy: 250,
                ..cell
            },
        );

        return;
    }
    let dy = rand_int(2);
    let dnbr = api.get(dx * dy, dy);
    if dnbr.species == Species::Air || dnbr.species == Species::Water {
        api.set(0, 0, dnbr);
        api.set(dx * dy, dy, cell);
    } else {
        api.set(
            0,
            0,
            Cell {
                age: cell
                    .age
                    .saturating_add(cell.clock * (rand_int(5) / 4) as u8),
                ..cell
            },
        );
    }
}

// pub fn update_zoop(cell: Cell, mut api: SandApi) {
//     let down = api.get(0, 1);
//     if down.species == Species::Air {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(0, 1, cell);

//         return;
//     }
//     let (dx, dy) = rand_vec();
//     // if cell.age > 250 {
//     //     api.set(0, 0, Cell::new(Species::Waste));
//     //     return;
//     // }
//     let nbr = api.get(dx, dy);
//     if nbr.species == Species::Water {
//         api.set(0, 0, nbr);
//         api.set(
//             dx,
//             dy,
//             Cell {
//                 energy: cell.energy,
//                 age: cell.age + api.universe.generation,
//                 ..cell
//             },
//         );
//         if cell.age > 100 && api.use_oxygen() {
//             api.set(
//                 0,
//                 0,
//                 Cell {
//                     energy: cell.energy / 2,
//                     age: 0,
//                     ..cell
//                 },
//             );
//         }
//     }
// }
const Fish_padding: u8 = 1;
pub fn update_Fish(cell: Cell, mut api: SandApi) {
    let down = api.get(0, 1);
    if down.species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);

        return;
    }
    let down = api.get(0, 1);

    if down.species == Species::Air {
        api.set(0, 0, down);
        api.set(0, 1, cell);
        return;
    }
    let age = cell.age;
    let energy = cell.energy;
    let (sx, sy) = rand_vec_8();
    let sample = api.get(sx, sy);
    // api.use_oxygen();
    // Eat
    if sample.species == Species::Zoop {
        api.set(
            0,
            0,
            Cell {
                energy: energy.saturating_add(10 + sample.energy / 2),
                ..cell
            },
        );
        api.set(sx, sy, Cell::new(Species::Water));

        if energy > 230 && api.use_oxygen() {
            let new_energy = energy / 4;
            api.set(
                sx,
                sy,
                Cell {
                    species: Species::Fish,
                    energy: new_energy * 3,
                    age: 0,
                    ..cell
                },
            );

            api.set(
                0,
                0,
                Cell {
                    energy: new_energy,
                    ..cell
                },
            );
        }
        return;
    }

    if energy == 0 {
        api.set(0, 0, WASTE);
        return;
    }

    if age == 0 {
        // kick
        let (mut dx, mut dy) = (rand_dir_2(), 0);
        let nbr = api.get(dx, dy);
        if nbr.species != Species::Water {
            dx *= -1;
            dy *= -1;
        }
        if api.use_oxygen() {
            api.set(
                0,
                0,
                Cell {
                    age: Fish_padding + join_dy_dx(dx, dy, 0),
                    energy: energy.saturating_sub(0),

                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    energy: energy.saturating_sub(0),
                    ..cell
                },
            );
        }
    } else {
        // swimming
        let (dx, dy, rem) = split_dy_dx(cell.age - Fish_padding);
        if once_in(50) {
            api.set(0, 0, Cell { age: 0, ..cell });
            return;
        }
        let nbr = api.get(dx, dy);
        //   api.use_oxygen()
        if (nbr.species == Species::Water || nbr.species == Species::FishTail)
        // && (api.use_oxygen())
        {
            let fish_length = (energy + 25) / 25;

            api.set(
                0,
                0,
                Cell {
                    species: Species::FishTail,
                    energy: 1,
                    age: fish_length,
                    clock: cell.clock,
                },
            );
            if api.get(0, 1).species == Species::Water {
                api.set(
                    0,
                    1,
                    Cell {
                        species: Species::FishTail,
                        energy: 0,
                        age: fish_length.saturating_sub(1),
                        clock: cell.clock,
                    },
                );
            }
            if api.get(0, -1).species == Species::Water {
                api.set(
                    0,
                    -1,
                    Cell {
                        species: Species::FishTail,
                        energy: 0,
                        age: fish_length.saturating_sub(2),
                        clock: cell.clock,
                    },
                );
            }

            let (ndx, ndy) = match rand_int(50) {
                0 => adjacency_left((dx, dy)),
                1 => adjacency_right((dx, dy)),
                _ => (dx, dy),
            };
            api.set(
                dx,
                dy,
                Cell {
                    age: Fish_padding + join_dy_dx(ndx, ndy, rem),
                    // energy: energy.saturating_sub(cell.clock),
                    ..cell
                },
            );
        } else {
            api.set(
                0,
                0,
                Cell {
                    age: Fish_padding + join_dy_dx(-dx, dy, rem),
                    energy: energy.saturating_sub(cell.clock % 2),
                    ..cell
                },
            );
        }
    }
}

pub fn update_stone(cell: Cell, mut api: SandApi) {
    if api.get(-1, -1).species == Species::Stone && api.get(1, -1).species == Species::Stone {
        return;
    }

    let nbr = api.get(0, 1);
    let nbr_species = nbr.species;
    if nbr_species == Species::Air {
        api.set(0, 0, EMPTY_CELL);
        api.set(0, 1, cell);
    } else if nbr_species == Species::Water {
        api.set(0, 0, nbr);
        api.set(0, 1, cell);
    } else {
        api.set(0, 0, cell);
    }
}

pub fn update_plant(cell: Cell, mut api: SandApi) {
    let (dx, dy) = rand_vec_8();
    let energy = cell.energy;

    let light = api.get_light().sun;
    // todo slow down and give max age

    if energy > 200
        && rand_int(light as i32) > 100
        && (api.get(dx, -1).species == Species::Water
            && api.get(0, -1).species == Species::Water
            && api.get(-dx, -1).species == Species::Water
            && api.get(dx * 2, -1).species == Species::Water
            && api.use_co2())
    {
        // let i = rand_int(100);
        api.set(
            dx,
            -1,
            Cell {
                energy: 10,
                age: 0,
                ..cell
            },
        );
        api.set(0, 0, Cell { energy: 10, ..cell });
        // api.set(-dx, dy, EMPTY_CELL);
    }

    let nbr = api.get(dx, dy);

    if nbr.species == Species::Plant || nbr.species == Species::Sand {
        //diffuse nutrients

        let shared_energy = (energy / 2) + (nbr.energy / 2);
        let cappilary_action = dy * -2;

        let new_energy = cmp::min(
            (((energy / 2) + (shared_energy / 2)) as i32).saturating_sub(cappilary_action),
            255,
        ) as u8;

        let new_nbr_energy = cmp::min(
            (((nbr.energy / 2) + (shared_energy / 2)) as i32).saturating_add(cappilary_action),
            255,
        ) as u8;

        api.set(
            dx,
            dy,
            Cell {
                energy: new_nbr_energy,
                ..nbr
            },
        );
        api.set(
            0,
            0,
            Cell {
                energy: new_energy,
                ..cell
            },
        );
    }
}

pub fn update_seed(cell: Cell, mut api: SandApi) {
    let age = cell.age;
    let energy = cell.energy;

    let (dx, dy) = rand_vec();

    let nbr_species = api.get(dx, dy).species;

    if age == 0 {
        //falling

        let dxf = rand_dir(); //falling dx
        let nbr_species_below = api.get(dxf, 1).species;
        if nbr_species_below == Species::Sand || nbr_species_below == Species::Plant {
            api.set(
                0,
                0,
                Cell {
                    age: (rand_int(253) + 1) as u8,
                    ..cell
                },
            );
            return;
        }

        let nbr = api.get(0, 1);
        if nbr.species == Species::Air {
            api.set(0, 0, EMPTY_CELL);
            api.set(0, 1, cell);
        } else if api.get(dxf, 1).species == Species::Air {
            api.set(0, 0, EMPTY_CELL);
            api.set(dxf, 1, cell);
        } else if nbr.species == Species::Water {
            api.set(0, 0, nbr);
            api.set(0, 1, cell);
        } else {
            api.set(0, 0, cell);
        }
    } else {
        if energy > 60 {
            //stem
            let dxr = rand_dir(); //raising dx
            if rand_int(100) > 75 {
                if (api.get(dxr, -1).species == Species::Air
                    || api.get(dxr, -1).species == Species::Sand
                    || api.get(dxr, -1).species == Species::Seed)
                    && api.get(1, -1).species != Species::Plant
                    && api.get(-1, -1).species != Species::Plant
                {
                    api.set(
                        dxr,
                        -1,
                        Cell {
                            energy: (energy as i32 - rand_int(10)) as u8,
                            ..cell
                        },
                    );
                    api.set(
                        0,
                        0,
                        Cell {
                            species: Species::Plant,
                            energy: 80 + (js_sys::Math::random() * 30.) as u8,
                            age: 0,
                            clock: 0,
                        },
                    )
                } else {
                    api.set(0, 0, WATER);
                }
            }
        } else {
            if nbr_species == Species::Water {
                api.set(dx, dy, Cell::new(Species::Seed))
            }
        }
    }
}

// pub fn update_mite(cell: Cell, mut api: SandApi) {
//     let mut i = rand_int(100);
//     let mut dx = 0;
//     if cell.ra < 20 {
//         dx = (cell.ra as i32) - 1;
//     }
//     let mut dy = 1;
//     let mut mite = cell.clone();

//     if cell.rb > 10 {
//         // /
//         mite.rb = mite.rb.saturating_sub(1);
//         dy = -1;
//     } else if cell.rb > 1 {
//         // \
//         mite.rb = mite.rb.saturating_sub(1);
//     } else {
//         // |
//         dx = 0;
//     }
//     let nbr = api.get(dx, dy);

//     let sx = (i % 3) - 1;
//     i = rand_int(1000);
//     let sy = (i % 3) - 1;
//     let sample = api.get(sx, sy).species;

//     if (sample == Species::Plant || sample == Species::Seed) && i > 800 {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(sx, sy, cell);

//         return;
//     }

//     if nbr.species == Species::Air {
//         api.set(0, 0, EMPTY_CELL);
//         api.set(dx, dy, mite);
//     } else if dy == 1 && i > 800 {
//         i = rand_int(100);
//         let mut ndx = (i % 3) - 1;
//         if i < 6 {
//             //switch direction
//             ndx = dx;
//         }

//         mite.ra = (1 + ndx) as u8;
//         mite.rb = 10 + (i % 10) as u8; //hop height

//         api.set(0, 0, mite);
//     } else {
//         if api.get(-1, 0).species == Species::Mite
//             && api.get(1, 0).species == Species::Mite
//             && api.get(0, -1).species == Species::Mite
//         {
//             api.set(0, 0, EMPTY_CELL);
//         } else {
//             api.set(0, 0, mite);
//         }
//     }
// }
