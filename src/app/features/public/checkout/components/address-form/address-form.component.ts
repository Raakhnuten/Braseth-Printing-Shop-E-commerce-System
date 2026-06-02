import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss',
  imports: [ReactiveFormsModule],
})
export class AddressFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) submitted = false;
  @Input() title = 'Customer Details';
  @Input() icon = 'pi pi-user';
}
